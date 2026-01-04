# Clone 4ga Boards repository into a directory of your choice
# (e.g. /var/www/4gaBoards)
mkdir -p /var/www/4gaBoards
cd /var/www/4gaBoards
git clone https://github.com/RARgames/4gaBoards.git .

# Install dependencies (You can use yarn or pnpm instead of npm)
npm i

# Build client
npm run client:build
Copy build to the server directory
cp -r client/build server/public
cp client/build/index.html server/views/index.ejs
Copy environment variables file
cp server/.env.sample server/.env

# Configure environment variables (You could use nano, vim, etc. to edit .env file)
nano server/.env

# Edit BASE_URL to match your domain name or IP address.
# Edit SECRET_KEY with a random value. You can generate it by openssl rand -hex 64.
# Edit DATABASE_URL with database url in the following format: postgresql://<username>:<password>@<host>/<database_name>.

# Note: Before continuing, make sure your selected database is created and running.

# Copy start script from the root directory to the server directory and start the server.
cp start.sh server
cd server
./start.sh

# Default 4ga Boards url: http://localhost:1337
# Default user: demo
# Default password: demo