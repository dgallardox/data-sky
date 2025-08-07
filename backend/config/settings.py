import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DEFAULT_PORT = 5001
    
    def __init__(self):
        self.port = int(os.getenv('SERVER_PORT', self.DEFAULT_PORT))
        self.host = os.getenv('SERVER_HOST', '127.0.0.1')
        self.debug = os.getenv('DEBUG', 'False').lower() == 'true'
        self.data_dir = os.getenv('DATA_DIR', 'data')
        
    def update_port(self, new_port: int):
        self.port = new_port
        
    def to_dict(self):
        return {
            'port': self.port,
            'host': self.host,
            'debug': self.debug,
            'data_dir': self.data_dir
        }


settings = Settings()