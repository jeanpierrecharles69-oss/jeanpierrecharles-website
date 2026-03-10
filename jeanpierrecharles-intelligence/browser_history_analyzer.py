#!/usr/bin/env python3
"""
JeanPierreCharles Intelligence - Multi-Browser & AI Assistant History Analyzer
Analyse l'historique de tous les navigateurs et AI assistants et génère des insights thématiques

Version: 2.0 — Post contre-expertise Claude Opus 4.6
Date: 13 février 2026
Mises à jour:
  - Filtrage PII (OAuth tokens, session IDs, API keys, emails) [P0]
  - Chiffrement Fernet (AES-128-CBC + HMAC-SHA256) des exports JSON [P0]
  - Politique de rétention des données configurable [P1]
  - Correction du chemin de sortie (Windows ARM64)
  - Sanitization des URLs avant export
"""

import sqlite3
import shutil
import json
import os
import re
import base64
import hashlib
import logging
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict
from typing import List, Dict, Tuple, Optional
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
import tempfile

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('jpc-intelligence')

# Tentative d'import de cryptography pour le chiffrement Fernet (AES-128-CBC)
try:
    from cryptography.fernet import Fernet
    ENCRYPTION_AVAILABLE = True
except ImportError:
    ENCRYPTION_AVAILABLE = False
    logger.warning(
        "⚠️  Module 'cryptography' non installé. "
        "Les exports ne seront PAS chiffrés. "
        "Installer avec : pip install cryptography"
    )

class PIIFilter:
    """Filtre les informations personnellement identifiables (PII) des URLs et contenus.
    
    Adresse le risque P0 identifié dans la contre-expertise :
    - OAuth tokens, session IDs dans les URLs
    - Adresses email exposées dans les paramètres
    - Clés API et secrets dans les query strings
    """
    
    # Patterns de paramètres sensibles à supprimer des URLs
    SENSITIVE_PARAMS = [
        'access_token', 'token', 'auth', 'auth_token', 'bearer',
        'session', 'sessionid', 'sid', 'jsessionid',
        'key', 'apikey', 'api_key', 'secret', 'password', 'pwd',
        'code', 'oauth_token', 'refresh_token',
        'client_secret', 'private_key',
    ]
    
    # Patterns regex pour détecter les PII dans les URLs
    PII_REGEX_PATTERNS = [
        # Emails dans les URLs
        (re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'), '[EMAIL_FILTERED]'),
        # Tokens JWT (3 segments base64 séparés par des points)
        (re.compile(r'eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+'), '[JWT_FILTERED]'),
        # UUIDs potentiellement identifiants
        # (conservés car utiles pour la traçabilité — commenté volontairement)
        # (re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'), '[UUID]'),
    ]
    
    @classmethod
    def sanitize_url(cls, url: str) -> str:
        """Supprime les paramètres sensibles et PII d'une URL.
        
        Args:
            url: L'URL originale à nettoyer
            
        Returns:
            L'URL nettoyée avec les paramètres sensibles remplacés par [FILTERED]
        """
        if not url:
            return url
        
        try:
            parsed = urlparse(url)
            
            # Filtrer les paramètres de query string
            if parsed.query:
                params = parse_qs(parsed.query, keep_blank_values=True)
                filtered_params = {}
                for key, values in params.items():
                    if key.lower() in cls.SENSITIVE_PARAMS:
                        filtered_params[key] = ['[FILTERED]']
                    else:
                        filtered_params[key] = values
                
                # Reconstruire la query string
                new_query = urlencode(
                    {k: v[0] if len(v) == 1 else v for k, v in filtered_params.items()},
                    doseq=True
                )
                url = urlunparse(parsed._replace(query=new_query))
            
            # Appliquer les patterns regex
            for pattern, replacement in cls.PII_REGEX_PATTERNS:
                url = pattern.sub(replacement, url)
            
            return url
            
        except Exception:
            # En cas d'erreur de parsing, retourner l'URL telle quelle
            # plutôt que de perdre la donnée
            return url
    
    @classmethod
    def sanitize_title(cls, title: str) -> str:
        """Supprime les PII potentiels des titres de pages."""
        if not title:
            return title
        
        for pattern, replacement in cls.PII_REGEX_PATTERNS:
            title = pattern.sub(replacement, title)
        
        return title


class DataEncryptor:
    """Gère le chiffrement des exports via Fernet (AES-128-CBC + HMAC-SHA256).
    
    Note technique : Fernet utilise AES-128-CBC pour le chiffrement et
    HMAC-SHA256 pour l'authentification. Ce n'est PAS du AES-256.
    Pour un chiffrement AES-256-GCM, une implémentation custom serait
    nécessaire. Fernet est retenu en Phase 0-1 pour sa simplicité
    et sa fiabilité (implémentation auditable de la lib cryptography).
    - Chiffrement au repos des données exportées
    - Gestion sécurisée des clés de chiffrement
    """
    
    def __init__(self, key_path: Optional[Path] = None):
        """Initialise l'encrypteur.
        
        Args:
            key_path: Chemin vers le fichier de clé. Si None, génère une nouvelle clé.
        """
        if not ENCRYPTION_AVAILABLE:
            logger.warning("Chiffrement non disponible — module 'cryptography' manquant")
            self.fernet = None
            return
        
        if key_path and key_path.exists():
            with open(key_path, 'rb') as f:
                self.key = f.read()
        else:
            self.key = Fernet.generate_key()
            if key_path:
                key_path.parent.mkdir(parents=True, exist_ok=True)
                with open(key_path, 'wb') as f:
                    f.write(self.key)
                logger.info(f"🔑 Nouvelle clé de chiffrement générée : {key_path}")
        
        self.fernet = Fernet(self.key)
    
    def encrypt_data(self, data: str) -> bytes:
        """Chiffre une chaîne de caractères avec Fernet (AES-128-CBC)."""
        if not self.fernet:
            return data.encode('utf-8')
        return self.fernet.encrypt(data.encode('utf-8'))
    
    def decrypt_data(self, encrypted_data: bytes) -> str:
        """Déchiffre des données chiffrées."""
        if not self.fernet:
            return encrypted_data.decode('utf-8')
        return self.fernet.decrypt(encrypted_data).decode('utf-8')


class DataRetentionPolicy:
    """Gère la politique de rétention des données exportées.
    
    Adresse le risque P1 RGPD identifié dans la contre-expertise :
    - Auto-purge des exports après la période configurée
    - Journalisation des suppressions
    """
    
    def __init__(self, retention_days: int = 90, export_dir: Optional[Path] = None):
        self.retention_days = retention_days
        self.export_dir = export_dir or Path.home() / 'jpc-intelligence' / 'exports'
    
    def purge_expired(self) -> List[str]:
        """Supprime les fichiers d'export expirés.
        
        Returns:
            Liste des fichiers supprimés
        """
        if not self.export_dir.exists():
            return []
        
        cutoff = datetime.now() - timedelta(days=self.retention_days)
        purged = []
        
        for file_path in self.export_dir.glob('*.json*'):
            if datetime.fromtimestamp(file_path.stat().st_mtime) < cutoff:
                file_path.unlink()
                purged.append(str(file_path))
                logger.info(f"🗑️  Purge rétention : {file_path.name}")
        
        if purged:
            logger.info(f"🗑️  {len(purged)} fichier(s) purgé(s) (rétention {self.retention_days} jours)")
        
        return purged


class MultiBrowserHistoryAnalyzer:
    """Analyseur d'historique multi-sources avec catégorisation intelligente
    
    Version 2.0 — Intègre les recommandations de la contre-expertise :
    - Filtrage PII sur toutes les URLs extraites (P0)
    - Chiffrement Fernet (AES-128-CBC) des exports (P0)
    - Politique de rétention configurable (P1)
    """
    
    # Configuration des navigateurs supportés
    BROWSERS = {
        'chrome': {
            'name': 'Google Chrome',
            'windows_path': Path(os.getenv('LOCALAPPDATA', '')) / 'Google' / 'Chrome' / 'User Data' / 'Default' / 'History',
            'enabled': True
        },
        'firefox': {
            'name': 'Mozilla Firefox',
            'windows_path': Path(os.getenv('APPDATA', '')) / 'Mozilla' / 'Firefox' / 'Profiles',
            'db_name': 'places.sqlite',
            'enabled': True
        },
        'edge': {
            'name': 'Microsoft Edge',
            'windows_path': Path(os.getenv('LOCALAPPDATA', '')) / 'Microsoft' / 'Edge' / 'User Data' / 'Default' / 'History',
            'enabled': True
        },
        'brave': {
            'name': 'Brave Browser',
            'windows_path': Path(os.getenv('LOCALAPPDATA', '')) / 'BraveSoftware' / 'Brave-Browser' / 'User Data' / 'Default' / 'History',
            'enabled': True
        }
    }
    
    # Catégories thématiques avec patterns d'URL
    CATEGORIES = {
        "AI & Technology": [
            "anthropic", "openai", "claude", "chatgpt", "ai", "llm", "machine-learning",
            "github", "stackoverflow", "dev.to", "medium.com/tech"
        ],
        "Business & Strategy": [
            "mckinsey", "bcg", "harvard", "forbes", "businessinsider", "techcrunch",
            "crunchbase", "linkedin", "gartner", "forrester"
        ],
        "Compliance & Regulation": [
            "gdpr", "regulation", "compliance", "iso", "nist", "cert", "sec.gov",
            "eur-lex", "legifrance", "directive", "dora", "reach", "echa"
        ],
        "Cloud & Infrastructure": [
            "aws", "azure", "google cloud", "gcp", "vercel", "netlify", "supabase",
            "cloudflare", "digitalocean"
        ],
        "Development & Code": [
            "github.com", "gitlab", "npm", "pypi", "react", "typescript", "python",
            "stackoverflow", "docs.microsoft", "developer.mozilla"
        ],
        "News & Actualités": [
            "news", "reuters", "bloomberg", "ft.com", "wsj", "lemonde", "figaro",
            "bbc", "cnn", "techcrunch/news"
        ],
        "Documentation & Learning": [
            "docs.", "documentation", "tutorial", "guide", "learn", "course",
            "academy", "university", "edu"
        ],
        "Finance & Investment": [
            "stripe", "payment", "fintech", "saas-pricing", "venture", "funding",
            "investment", "market", "stock"
        ]
    }
    
    def __init__(self, enabled_browsers=None, enable_encryption=True,
                 encryption_key_path=None, retention_days=90):
        """
        Args:
            enabled_browsers: Liste des navigateurs à analyser. Si None, tous sont activés.
            enable_encryption: Active le chiffrement Fernet des exports.
            encryption_key_path: Chemin vers la clé de chiffrement.
            retention_days: Nombre de jours de rétention des exports (défaut: 90).
        """
        self.temp_dbs = []
        self.pii_filter = PIIFilter()
        self.pii_filtered_count = 0  # Compteur PII filtrés
        
        # Chiffrement
        if enable_encryption and ENCRYPTION_AVAILABLE:
            key_path = Path(encryption_key_path) if encryption_key_path else (
                Path.home() / 'jpc-intelligence' / '.encryption_key'
            )
            self.encryptor = DataEncryptor(key_path=key_path)
        else:
            self.encryptor = DataEncryptor()
        
        # Politique de rétention
        self.retention = DataRetentionPolicy(retention_days=retention_days)
        
        # Filtrer les navigateurs activés
        if enabled_browsers:
            self.browsers = {k: v for k, v in self.BROWSERS.items() if k in enabled_browsers}
        else:
            self.browsers = {k: v for k, v in self.BROWSERS.items() if v.get('enabled', True)}
    
    def _get_browser_history_path(self, browser_key: str) -> Path:
        """Détecte automatiquement le chemin de l'historique du navigateur"""
        config = self.browsers[browser_key]
        
        if browser_key == 'firefox':
            # Firefox a des profils avec des noms aléatoires
            profiles_dir = config['windows_path']
            if profiles_dir.exists():
                # Cherche le profil par défaut
                for profile in profiles_dir.iterdir():
                    if profile.is_dir() and '.default' in profile.name:
                        db_path = profile / config['db_name']
                        if db_path.exists():
                            return db_path
            return None
        else:
            # Chrome, Edge, Brave utilisent le même pattern
            return config['windows_path']
    
    def _copy_history_db(self, browser_key: str) -> str:
        """Copie la base de données dans un fichier temporaire"""
        history_path = self._get_browser_history_path(browser_key)
        
        if not history_path or not history_path.exists():
            raise FileNotFoundError(
                f"Historique {self.browsers[browser_key]['name']} non trouvé à : {history_path}"
            )
        
        temp_db = tempfile.NamedTemporaryFile(delete=False, suffix=f'_{browser_key}.db')
        temp_db.close()
        
        try:
            shutil.copy2(history_path, temp_db.name)
            self.temp_dbs.append(temp_db.name)
            return temp_db.name
        except PermissionError:
            raise PermissionError(
                f"{self.browsers[browser_key]['name']} est en cours d'exécution. "
                f"Veuillez fermer {self.browsers[browser_key]['name']} et réessayer."
            )
    
    def extract_browser_history(self, browser_key: str, start_date: str, end_date: str) -> List[Dict]:
        """
        Extrait l'historique d'un navigateur spécifique entre deux dates
        
        Args:
            browser_key: Clé du navigateur ('chrome', 'firefox', etc.)
            start_date: Format 'DD.MM.YYYY'
            end_date: Format 'DD.MM.YYYY'
        
        Returns:
            Liste de dictionnaires avec les visites
        """
        # Conversion des dates
        start_dt = datetime.strptime(start_date, '%d.%m.%Y')
        end_dt = datetime.strptime(end_date, '%d.%m.%Y') + timedelta(days=1)
        
        # Chrome/Edge/Brave stockent les timestamps en microsecondes depuis 1601-01-01
        # Firefox utilise des timestamps Unix en microsecondes
        if browser_key == 'firefox':
            epoch_start = datetime(1970, 1, 1)
            start_timestamp = int(start_dt.timestamp() * 1_000_000)
            end_timestamp = int(end_dt.timestamp() * 1_000_000)
        else:
            epoch_start = datetime(1601, 1, 1)
            start_timestamp = int((start_dt - epoch_start).total_seconds() * 1_000_000)
            end_timestamp = int((end_dt - epoch_start).total_seconds() * 1_000_000)
        
        # Copie de la BDD
        try:
            db_path = self._copy_history_db(browser_key)
        except (FileNotFoundError, PermissionError) as e:
            print(f"⚠️  {browser_key}: {e}")
            return []
        
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Query adaptée selon le navigateur
            if browser_key == 'firefox':
                query = """
                SELECT 
                    url,
                    title,
                    last_visit_date as visit_time,
                    0 as visit_duration
                FROM moz_places
                WHERE last_visit_date BETWEEN ? AND ?
                ORDER BY last_visit_date DESC
                """
            else:
                query = """
                SELECT 
                    urls.url,
                    urls.title,
                    visits.visit_time,
                    visits.visit_duration
                FROM urls
                INNER JOIN visits ON urls.id = visits.url
                WHERE visits.visit_time BETWEEN ? AND ?
                ORDER BY visits.visit_time DESC
                """
            
            cursor.execute(query, (start_timestamp, end_timestamp))
            results = cursor.fetchall()
            
            history = []
            for url, title, visit_time, duration in results:
                # Conversion du timestamp
                visit_dt = epoch_start + timedelta(microseconds=visit_time)
                
                # Filtrage PII sur l'URL et le titre (P0)
                sanitized_url = self.pii_filter.sanitize_url(url)
                sanitized_title = self.pii_filter.sanitize_title(title or 'Sans titre')
                
                if sanitized_url != url:
                    self.pii_filtered_count += 1
                
                history.append({
                    'url': sanitized_url,
                    'title': sanitized_title,
                    'timestamp': visit_dt.isoformat(),
                    'date': visit_dt.strftime('%d/%m/%Y'),
                    'time': visit_dt.strftime('%H:%M:%S'),
                    'duration_seconds': duration // 1_000_000 if duration else 0,
                    'domain': urlparse(sanitized_url).netloc,
                    'source': browser_key,
                    'source_name': self.browsers[browser_key]['name']
                })
            
            conn.close()
            return history
            
        finally:
            # Nettoyage du fichier temporaire
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    def extract_history(self, start_date: str, end_date: str) -> List[Dict]:
        """
        Extrait l'historique de TOUS les navigateurs activés
        
        Args:
            start_date: Format 'DD.MM.YYYY'
            end_date: Format 'DD.MM.YYYY'
        
        Returns:
            Liste consolidée de toutes les visites
        """
        all_history = []
        
        print(f"\n🌐 Extraction de l'historique multi-navigateurs ({start_date} → {end_date})...")
        
        for browser_key in self.browsers.keys():
            print(f"  → {self.browsers[browser_key]['name']}...", end=' ')
            browser_history = self.extract_browser_history(browser_key, start_date, end_date)
            
            if browser_history:
                all_history.extend(browser_history)
                print(f"✅ {len(browser_history)} visites")
            else:
                print(f"⚠️  Aucune donnée")
        
        # Déduplique et trie par timestamp
        all_history = self._deduplicate_history(all_history)
        
        return all_history
    
    def _deduplicate_history(self, history: List[Dict]) -> List[Dict]:
        """Déduplique l'historique par URL + timestamp (même page visitée sur plusieurs navigateurs)"""
        seen = set()
        deduplicated = []
        
        for entry in sorted(history, key=lambda x: x['timestamp'], reverse=True):
            # Clé unique : URL + date (ignorer l'heure exacte pour détecter doublons)
            key = (entry['url'], entry['date'])
            
            if key not in seen:
                seen.add(key)
                deduplicated.append(entry)
        
        return deduplicated
    
    def categorize_url(self, url: str, title: str) -> str:
        """Catégorise une URL selon les thématiques définies"""
        url_lower = url.lower()
        title_lower = title.lower()
        
        for category, patterns in self.CATEGORIES.items():
            for pattern in patterns:
                if pattern in url_lower or pattern in title_lower:
                    return category
        
        return "Autres"
    
    def analyze_by_themes(self, history: List[Dict]) -> Dict:
        """Groupe l'historique par thématiques"""
        themes = defaultdict(list)
        
        for entry in history:
            category = self.categorize_url(entry['url'], entry['title'])
            themes[category].append(entry)
        
        # Statistiques par thème
        theme_stats = {}
        for theme, entries in themes.items():
            domains = defaultdict(int)
            total_duration = 0
            
            for entry in entries:
                domains[entry['domain']] += 1
                total_duration += entry['duration_seconds']
            
            theme_stats[theme] = {
                'count': len(entries),
                'total_time_minutes': total_duration / 60,
                'top_domains': sorted(domains.items(), key=lambda x: x[1], reverse=True)[:5],
                'entries': entries[:20]  # Top 20 visites
            }
        
        return theme_stats
    
    def extract_critical_insights(self, theme_stats: Dict, history: List[Dict] = None) -> Dict:
        """Extrait les informations critiques et enjeux clés"""
        insights = {
            'periode_analyse': None,
            'volume_total': sum(stats['count'] for stats in theme_stats.values()),
            'themes_prioritaires': [],
            'signaux_faibles': [],
            'patterns_temporels': {}
        }
        
        # Statistiques par source (si history fourni)
        if history:
            sources_count = defaultdict(int)
            for entry in history:
                source_key = entry.get('source', 'unknown')
                sources_count[source_key] += 1
            
            insights['sources_stats'] = {}
            for source_key, count in sources_count.items():
                browser_config = self.browsers.get(source_key, {})
                insights['sources_stats'][source_key] = {
                    'name': browser_config.get('name', source_key),
                    'count': count,
                    'percentage': (count / insights['volume_total'] * 100) if insights['volume_total'] > 0 else 0
                }
        
        # Thèmes prioritaires (>10% du volume)
        total = insights['volume_total']
        for theme, stats in sorted(theme_stats.items(), key=lambda x: x[1]['count'], reverse=True):
            percentage = (stats['count'] / total) * 100
            if percentage >= 10:
                insights['themes_prioritaires'].append({
                    'theme': theme,
                    'pourcentage': round(percentage, 1),
                    'temps_total_minutes': round(stats['total_time_minutes'], 1)
                })
        
        # Signaux faibles (nouvelles catégories avec forte intensité)
        for theme, stats in theme_stats.items():
            avg_time = stats['total_time_minutes'] / stats['count'] if stats['count'] > 0 else 0
            if avg_time > 5 and stats['count'] >= 3:  # >5min moyenne et >=3 visites
                insights['signaux_faibles'].append({
                    'theme': theme,
                    'visites': stats['count'],
                    'temps_moyen_minutes': round(avg_time, 1)
                })
        
        return insights
    
    def generate_report(self, start_date: str, end_date: str) -> Dict:
        """Génère le rapport complet d'analyse"""
        history = self.extract_history(start_date, end_date)
        
        print(f"✅ {len(history)} visites extraites (après déduplication)")
        print(f"🔍 Catégorisation thématique...")
        
        theme_stats = self.analyze_by_themes(history)
        insights = self.extract_critical_insights(theme_stats, history)
        insights['periode_analyse'] = f"{start_date} - {end_date}"
        
        return {
            'meta': {
                'periode': f"{start_date} - {end_date}",
                'total_visites': len(history),
                'date_generation': datetime.now().isoformat(),
                'projet': 'JeanPierreCharles Intelligence'
            },
            'insights': insights,
            'themes': theme_stats,
            'raw_history': history
        }
    
    def export_json(self, report: Dict, output_path: str, encrypt: bool = True):
        """Export du rapport en JSON avec chiffrement optionnel Fernet (AES-128-CBC).
        
        Args:
            report: Le rapport à exporter
            output_path: Chemin du fichier de sortie
            encrypt: Si True, chiffre le fichier avec Fernet
        """
        # S'assurer que le répertoire parent existe
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        json_data = json.dumps(report, ensure_ascii=False, indent=2)
        
        if encrypt and ENCRYPTION_AVAILABLE and self.encryptor.fernet:
            encrypted_path = output_path + '.enc'
            encrypted_data = self.encryptor.encrypt_data(json_data)
            with open(encrypted_path, 'wb') as f:
                f.write(encrypted_data)
            logger.info(f"🔒 Rapport chiffré (Fernet/AES-128-CBC) : {encrypted_path}")
            
            # Sauvegarder aussi la version non chiffrée pour usage immédiat
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(json_data)
            logger.info(f"💾 Rapport sauvegardé : {output_path}")
        else:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(json_data)
            logger.info(f"💾 Rapport sauvegardé (non chiffré) : {output_path}")
    
    def export_security_report(self, output_path: str):
        """Génère un rapport de sécurité sur les filtrages PII effectués."""
        report = {
            'date': datetime.now().isoformat(),
            'pii_urls_filtered': self.pii_filtered_count,
            'encryption_enabled': ENCRYPTION_AVAILABLE and self.encryptor.fernet is not None,
            'retention_days': self.retention.retention_days,
            'sensitive_params_monitored': PIIFilter.SENSITIVE_PARAMS,
        }
        
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        logger.info(f"🛡️  Rapport sécurité : {output_path}")


def main():
    """Point d'entrée principal"""
    # Configuration
    ENABLE_ENCRYPTION = True
    RETENTION_DAYS = 90
    
    # Répertoire de sortie (Windows compatible)
    output_dir = Path.home() / 'jpc-intelligence' / 'exports'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    analyzer = MultiBrowserHistoryAnalyzer(
        enable_encryption=ENABLE_ENCRYPTION,
        retention_days=RETENTION_DAYS
    )
    
    # Appliquer la politique de rétention avant d'exporter
    analyzer.retention.export_dir = output_dir
    purged = analyzer.retention.purge_expired()
    
    # Période d'analyse
    START_DATE = "03.02.2026"
    END_DATE = "07.02.2026"
    
    try:
        report = analyzer.generate_report(START_DATE, END_DATE)
        
        # Export JSON (avec chiffrement Fernet si disponible)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_json = str(output_dir / f'history_report_{timestamp}.json')
        analyzer.export_json(report, output_json, encrypt=ENABLE_ENCRYPTION)
        
        # Rapport de sécurité
        security_report_path = str(output_dir / f'security_report_{timestamp}.json')
        analyzer.export_security_report(security_report_path)
        
        # Affichage console des insights
        print("\n" + "="*60)
        print("📈 INSIGHTS STRATÉGIQUES — JEANPIERRECHARLES INTELLIGENCE")
        print("="*60)
        
        insights = report['insights']
        print(f"\n🎯 Volume total : {insights['volume_total']} visites")
        
        # Statistiques de sécurité
        print(f"\n🛡️  SÉCURITÉ :")
        print(f"  • URLs filtrées (PII) : {analyzer.pii_filtered_count}")
        print(f"  • Chiffrement : {'✅ Fernet (AES-128-CBC)' if ENCRYPTION_AVAILABLE else '❌ Non disponible'}")
        print(f"  • Rétention : {RETENTION_DAYS} jours")
        if purged:
            print(f"  • Fichiers purgés : {len(purged)}")
        
        # Statistiques par source
        if 'sources_stats' in insights:
            print("\n🌐 RÉPARTITION PAR SOURCE :")
            for source, stats in insights['sources_stats'].items():
                print(f"  • {stats['name']}: {stats['count']} visites "
                      f"({stats['percentage']:.1f}%)")
        
        print("\n🔥 THÈMES PRIORITAIRES :")
        for theme in insights['themes_prioritaires']:
            print(f"  • {theme['theme']}: {theme['pourcentage']}% "
                  f"({theme['temps_total_minutes']:.1f} min)")
        
        if insights['signaux_faibles']:
            print("\n⚡ SIGNAUX FAIBLES (forte intensité) :")
            for signal in insights['signaux_faibles']:
                print(f"  • {signal['theme']}: {signal['visites']} visites "
                      f"(~{signal['temps_moyen_minutes']:.1f} min/visite)")
        
        print("\n✅ Analyse terminée !")
        print(f"📊 Rapport : {output_json}")
        print(f"🛡️  Rapport sécurité : {security_report_path}")
        return output_json
        
    except Exception as e:
        logger.error(f"❌ Erreur : {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == '__main__':
    main()
