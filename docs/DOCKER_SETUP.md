# 🐳 Docker Compose Setup

This Docker Compose setup provides all the necessary services for running the Accountability Buddy application in a **development** environment.

## 📋 Services Included

### Core Services

- **MongoDB** (Port 27017) - Primary database with authentication
- **Redis** (Port 6379) - Caching and session storage
- **MinIO** (Ports 9000, 9001) - S3-compatible object storage for file uploads

### Optional Admin Tools (Profile: tools)

- **Mongo Express** (Port 8081) - MongoDB web admin interface
- **Redis Commander** (Port 8082) - Redis web admin interface

## 🚀 Quick Start

### 1. Start Core Services

```bash
docker-compose up -d
```

### 2. Start with Admin Tools

```bash
docker-compose --profile tools up -d
```

### 3. Stop Services

```bash
docker-compose down
```

### 4. Stop and Remove Volumes (⚠️ Destroys all data)

```bash
docker-compose down -v
```

## 🔐 Default Credentials

### MongoDB

- **Username**: admin
- **Password**: password
- **Database**: accountability-buddy
- **Connection String**: `mongodb://admin:password@localhost:27017/accountability-buddy?authSource=admin`

### Redis

- **Port**: 6379
- **Password**: None (development only)

### MinIO

- **Access Key**: admin
- **Secret Key**: password123
- **Console**: <http://localhost:9001>
- **API**: <http://localhost:9000>

### Admin Tools

- **Mongo Express**: <http://localhost:8081> (admin/password)
- **Redis Commander**: <http://localhost:8082>

## 📁 Persistent Storage

All services use named Docker volumes for data persistence:

- `mongodb_data` - MongoDB data files
- `mongodb_config` - MongoDB configuration
- `redis_data` - Redis data files
- `minio_data` - MinIO object storage

## 📊 Health Checks

All services include health checks:

- MongoDB: Database ping test
- Redis: Redis ping command
- MinIO: Health endpoint check

Check service health:

```bash
docker-compose ps
```

## 🔍 Troubleshooting

### Service Won't Start

1. Check if ports are already in use:

   ```bash
   lsof -i :27017,6379,9000,9001
   ```

2. View service logs:

   ```bash
   docker-compose logs [service-name]
   ```

### Reset Data

To completely reset all data:

```bash
docker-compose down -v
docker-compose up -d
```

### MongoDB Connection Issues

If you get authentication errors, ensure you're using the correct connection string with `authSource=admin`.

### MinIO Setup

After starting MinIO:

1. Access console at <http://localhost:9001>
2. Login with admin/password123
3. Create bucket named `accountability-uploads`
4. Set bucket policy to allow uploads

## 🌐 Network Configuration

Services communicate through a custom bridge network `accountability-network`, allowing:

- Service-to-service communication using service names
- Isolation from other Docker networks
- Automatic DNS resolution

## 📝 Production Notes

⚠️ **This configuration is for DEVELOPMENT only!**

For production:

- Use strong passwords and secrets
- Enable Redis authentication
- Configure MinIO with proper access policies
- Use environment-specific configuration files
- Consider using Docker secrets for sensitive data

## 🎯 Integration with Backend

The backend is configured to work with these services. Key environment variables:

```bash
# Database
MONGO_URI=mongodb://admin:password@localhost:27017/accountability-buddy?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Object Storage (MinIO as S3 replacement)
AWS_ACCESS_KEY_ID=admin
AWS_SECRET_ACCESS_KEY=password123
AWS_ENDPOINT=http://localhost:9000
AWS_S3_FORCE_PATH_STYLE=true
```
