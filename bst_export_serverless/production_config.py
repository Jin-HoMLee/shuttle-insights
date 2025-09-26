#!/usr/bin/env python3
"""
Production Configuration for BST API

Centralized configuration management with environment variable support
and secure defaults for production deployment.

Author: Jin-Ho M. Lee  
"""

import os
import sys
from typing import List, Dict, Any
from pydantic import Field
from pydantic_settings import BaseSettings
from base_config import DEFAULT_MODEL_CONFIG


class Environment:
    """Environment constants and utilities."""
    
    DEVELOPMENT = 'development'
    TESTING = 'testing'
    PRODUCTION = 'production'
    
    # Environment aliases for convenience
    ALIASES = {
        'dev': DEVELOPMENT,
        'devel': DEVELOPMENT,
        'develop': DEVELOPMENT,
        'test': TESTING,
        'prod': PRODUCTION,
    }
    
    @classmethod
    def get_current(cls) -> str:
        """Get the current environment, normalized to standard values."""
        env = os.getenv('ENV', cls.DEVELOPMENT).lower().strip()
        return cls.ALIASES.get(env, env)
    
    @classmethod
    def is_production(cls) -> bool:
        """Check if current environment is production."""
        return cls.get_current() == cls.PRODUCTION
    
    @classmethod
    def is_development(cls) -> bool:
        """Check if current environment is development."""
        return cls.get_current() == cls.DEVELOPMENT
    
    @classmethod
    def is_testing(cls) -> bool:
        """Check if current environment is testing."""
        return cls.get_current() == cls.TESTING


class SecurityConfig(BaseSettings):
    """Security-related configuration."""
    
    # Authentication
    require_auth: bool = Field(default=True, env='REQUIRE_AUTH')
    api_key_header: str = Field(default='X-API-Key', env='API_KEY_HEADER')
    admin_api_key: str = Field(default='', env='ADMIN_API_KEY')
    
    # OAuth
    oauth_enabled: bool = Field(default=False, env='OAUTH_ENABLED')
    oauth_provider: str = Field(default='google', env='OAUTH_PROVIDER')
    oauth_client_id: str = Field(default='', env='OAUTH_CLIENT_ID')
    oauth_client_secret: str = Field(default='', env='OAUTH_CLIENT_SECRET')
    
    # Rate Limiting
    rate_limit_requests: int = Field(default=100, env='RATE_LIMIT_REQUESTS')
    rate_limit_window: int = Field(default=3600, env='RATE_LIMIT_WINDOW')  # 1 hour
    
    # CORS
    cors_origins: List[str] = Field(default=['*'], env='CORS_ORIGINS')
    cors_credentials: bool = Field(default=True, env='CORS_CREDENTIALS')
    
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


class APIConfig(BaseSettings):
    """API server configuration."""
    
    # Server
    host: str = Field(default='0.0.0.0', env='HOST')
    port: int = Field(default=8000, env='PORT')
    debug: bool = Field(default=False, env='DEBUG')
    
    # Documentation
    enable_docs: bool = Field(default=True, env='ENABLE_DOCS')
    docs_url: str = Field(default='/docs', env='DOCS_URL')
    redoc_url: str = Field(default='/redoc', env='REDOC_URL')
    
    # API Metadata
    title: str = Field(default='BST Production API', env='API_TITLE')
    description: str = Field(default='Production-ready API for Badminton Stroke-type Transformer model inference', env='API_DESCRIPTION')
    version: str = Field(default='2.0.0', env='API_VERSION')
    
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


class ModelConfig(BaseSettings):
    """Model-related configuration extending base configuration."""
    
    # Model paths (inherit defaults from base config)
    torchscript_path: str = Field(default=DEFAULT_MODEL_CONFIG.torchscript_path, env='TORCHSCRIPT_MODEL_PATH')
    onnx_path: str = Field(default=DEFAULT_MODEL_CONFIG.onnx_path, env='ONNX_MODEL_PATH')
    
    # Model parameters (inherit defaults from base config)
    seq_len: int = Field(default=DEFAULT_MODEL_CONFIG.seq_len, env='MODEL_SEQ_LEN')
    n_people: int = Field(default=DEFAULT_MODEL_CONFIG.n_people, env='MODEL_N_PEOPLE')
    pose_features: int = Field(default=DEFAULT_MODEL_CONFIG.pose_features, env='MODEL_POSE_FEATURES')
    n_classes: int = Field(default=DEFAULT_MODEL_CONFIG.n_classes, env='MODEL_N_CLASSES')
    
    # Model loading (inherit defaults from base config)
    prefer_torchscript: bool = Field(default=DEFAULT_MODEL_CONFIG.prefer_torchscript, env='PREFER_TORCHSCRIPT')
    
    # Production-specific model settings
    model_cache_size: int = Field(default=1, env='MODEL_CACHE_SIZE')
    
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


class DatabaseConfig(BaseSettings):
    """Database configuration for persistent storage."""
    
    # Database URL (SQLite for local, PostgreSQL for production)
    database_url: str = Field(default='sqlite:///./bst_api.db', env='DATABASE_URL')
    
    # Connection settings
    db_pool_size: int = Field(default=5, env='DB_POOL_SIZE')
    db_max_overflow: int = Field(default=10, env='DB_MAX_OVERFLOW')
    db_echo: bool = Field(default=False, env='DB_ECHO')  # SQL logging
    
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


class RedisConfig(BaseSettings):
    """Redis configuration for distributed rate limiting."""
    
    # Redis connection
    redis_url: str = Field(default='redis://localhost:6379/0', env='REDIS_URL')
    redis_password: str = Field(default='', env='REDIS_PASSWORD')
    redis_db: int = Field(default=0, env='REDIS_DB')
    
    # Redis settings
    redis_max_pool_size: int = Field(default=10, env='REDIS_MAX_POOL_SIZE')
    redis_retry_on_timeout: bool = Field(default=True, env='REDIS_RETRY_ON_TIMEOUT')
    
    # Rate limiting key prefixes
    rate_limit_prefix: str = Field(default='bst_api:rate_limit:', env='RATE_LIMIT_PREFIX')
    
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


class LoggingConfig(BaseSettings):
    """Logging configuration."""
    
    # Log level
    log_level: str = Field(default='INFO', env='LOG_LEVEL')
    log_format: str = Field(default='json', env='LOG_FORMAT')  # json or text
    
    # Log files
    log_file: str = Field(default='', env='LOG_FILE')  # Empty = stdout only
    log_rotation: str = Field(default='1 day', env='LOG_ROTATION')
    log_retention: str = Field(default='30 days', env='LOG_RETENTION')
    
    # Request logging
    log_requests: bool = Field(default=True, env='LOG_REQUESTS')
    log_request_body: bool = Field(default=False, env='LOG_REQUEST_BODY')  # Security sensitive
    
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


class MonitoringConfig(BaseSettings):
    """Monitoring and metrics configuration."""
    
    # Prometheus metrics
    enable_metrics: bool = Field(default=False, env='ENABLE_METRICS')
    metrics_path: str = Field(default='/metrics', env='METRICS_PATH')
    
    # Health checks
    health_check_interval: int = Field(default=30, env='HEALTH_CHECK_INTERVAL')  # seconds
    
    # Performance monitoring
    track_inference_time: bool = Field(default=True, env='TRACK_INFERENCE_TIME')
    track_queue_size: bool = Field(default=True, env='TRACK_QUEUE_SIZE')
    
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


class ProductionConfig:
    """Combined configuration for production deployment."""
    
    def __init__(self):
        self.security = SecurityConfig()
        self.api = APIConfig()
        self.model = ModelConfig()
        self.database = DatabaseConfig()
        self.redis = RedisConfig()
        self.logging = LoggingConfig()
        self.monitoring = MonitoringConfig()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        return {
            'security': self.security.dict(),
            'api': self.api.dict(),
            'model': self.model.dict(),
            'database': self.database.dict(),
            'redis': self.redis.dict(),
            'logging': self.logging.dict(),
            'monitoring': self.monitoring.dict()
        }
    
    def validate_production_ready(self) -> List[str]:
        """Validate configuration for production deployment."""
        issues = []
        
        # Security checks
        if self.security.require_auth and not self.security.admin_api_key:
            issues.append("ADMIN_API_KEY not set but authentication is required")
        
        if self.security.oauth_enabled and not self.security.oauth_client_id:
            issues.append("OAuth enabled but OAUTH_CLIENT_ID not set")
        
        if '*' in self.security.cors_origins and self.security.require_auth:
            issues.append("CORS_ORIGINS includes '*' in production with authentication")
        
        # API checks
        if self.api.debug:
            issues.append("DEBUG mode enabled in production")
        
        # Model checks
        if not os.path.exists(self.model.torchscript_path) and not os.path.exists(self.model.onnx_path):
            issues.append("Neither TorchScript nor ONNX model file found")
        
        # Database checks
        if 'sqlite' in self.database.database_url.lower() and Environment.is_production():
            issues.append("Using SQLite database in production environment")
        
        return issues


# Global configuration instance
config = ProductionConfig()


# Environment-specific configurations
def get_config_for_environment(env: str = None) -> ProductionConfig:
    """Get configuration optimized for specific environment."""
    if env is None:
        env = Environment.get_current()
    else:
        # Normalize provided environment
        env = Environment.ALIASES.get(env.lower(), env.lower())
    
    cfg = ProductionConfig()
    
    if env == Environment.DEVELOPMENT:
        cfg.api.debug = True
        cfg.api.enable_docs = True
        cfg.security.require_auth = False
        cfg.logging.log_level = 'DEBUG'
        cfg.logging.log_requests = True
        
    elif env == Environment.TESTING:
        cfg.api.debug = False
        cfg.api.enable_docs = False
        cfg.security.require_auth = True
        cfg.security.rate_limit_requests = 1000  # Higher for testing
        cfg.logging.log_level = 'WARNING'
        cfg.database.database_url = 'sqlite:///:memory:'
        
    elif env == Environment.PRODUCTION:
        cfg.api.debug = False
        cfg.api.enable_docs = False
        cfg.security.require_auth = True
        cfg.security.cors_origins = [os.getenv('ALLOWED_ORIGIN', 'https://yourdomain.com')]
        cfg.logging.log_level = 'INFO'
        cfg.logging.log_request_body = False
        cfg.monitoring.enable_metrics = True
        cfg.database.database_url = os.getenv('DATABASE_URL', 'postgresql://user:pass@localhost/bst_api')
        
    return cfg


if __name__ == "__main__":
    """Configuration validation script."""
    import json
    
    print("BST Production API - Configuration Validation")
    print("=" * 50)
    
    # Load and display configuration
    cfg = get_config_for_environment()
    
    print(f"\nEnvironment: {Environment.get_current()}")
    print(f"Is Production: {Environment.is_production()}")
    print(f"Authentication Required: {cfg.security.require_auth}")
    print(f"OAuth Enabled: {cfg.security.oauth_enabled}")
    print(f"Rate Limit: {cfg.security.rate_limit_requests} requests/{cfg.security.rate_limit_window}s")
    print(f"Debug Mode: {cfg.api.debug}")
    print(f"Documentation: {cfg.api.enable_docs}")
    
    # Validate for production readiness
    issues = cfg.validate_production_ready()
    
    if issues:
        print(f"\n⚠️  Production Readiness Issues ({len(issues)}):")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
    else:
        print(f"\n✅ Configuration is production-ready!")
    
    # Option to output full configuration
    if '--full' in sys.argv:
        print(f"\nFull Configuration:")
        print(json.dumps(cfg.to_dict(), indent=2, default=str))