from pyftpdlib.authorizers import DummyAuthorizer
from pyftpdlib.handlers import FTPHandler
from pyftpdlib.servers import FTPServer
import os

def main():
    # Instantiate a dummy authorizer for managing 'virtual' users
    authorizer = DummyAuthorizer()

    # Define a new user having full r/w permissions and a read-only
    # anonymous user
    target_dir = os.path.join(os.getcwd(), 'public_html', 'blogs')
    
    # Create target directory if it doesn't exist
    os.makedirs(target_dir, exist_ok=True)
    
    print(f"Starting FTP server pointing to {target_dir}")
    authorizer.add_user('sazon', '12345', target_dir, perm='elradfmwMT')

    # Instantiate FTP handler class
    handler = FTPHandler
    handler.authorizer = authorizer
    handler.banner = "Mock Sazon FTP Server Ready."

    # Define a customized server callback
    address = ('0.0.0.0', 2121)
    server = FTPServer(address, handler)

    # set a limit for connections
    server.max_cons = 256
    server.max_cons_per_ip = 5

    # start ftp server
    server.serve_forever()

if __name__ == '__main__':
    main()
