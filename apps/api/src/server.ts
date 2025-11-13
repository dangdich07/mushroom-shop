// apps/api/src/server.ts
import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import { ProductModel } from './models/product.model';

const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mushroom';
const isProd = process.env.NODE_ENV === 'production';

// Khuyến nghị: giữ strictQuery để query “lạ” không bị bỏ qua
mongoose.set('strictQuery', true);

// Bật log query khi dev
if (!isProd) {
  mongoose.set('debug', Boolean(process.env.MONGO_DEBUG) || false);
}

let server: http.Server | null = null;

// Bảo hiểm runtime (không bắt buộc nhưng tốt)
process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('UncaughtException:', err);
  // Có thể quyết định process.exit(1) tuỳ chính sách triển khai
});

async function connectMongo() {
  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB || 'mushroom',
    serverSelectionTimeoutMS: 10_000, // 10s
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
  });
  console.log('✅ Connected to MongoDB:', mongoUri);

  // Chỉ sync index khi cần (mặc định bật ở dev; tắt ở prod nếu SYNC_INDEXES=0)
  const shouldSync =
    process.env.SYNC_INDEXES !== '0' && (!isProd || process.env.SYNC_INDEXES === '1');

  if (shouldSync) {
    console.log('🛠  Syncing product indexes…');
    try {
      await ProductModel.syncIndexes();
      console.log('✅ Product indexes are in sync');
    } catch (err) {
      console.error('❌ syncIndexes failed:', err);
      // Không exit ngay để server vẫn chạy; tuỳ bạn có thể throw để fail-fast
    }
  }

  // Log các sự kiện kết nối
  mongoose.connection.on('error', (e) => {
    console.error('⚠️  Mongo connection error:', e);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  Mongo disconnected');
  });
}

async function start() {
  await connectMongo();

  server = http.createServer(app);

  // Tinh chỉnh timeout để phù hợp proxy/nginx (tránh 408/504 cạnh tranh)
  // (Giá trị tham khảo: headersTimeout phải > keepAliveTimeout)
  server.keepAliveTimeout = 65_000; // 65s
  server.headersTimeout   = 66_000; // 66s

  server.listen(port, () => {
    console.log(`🚀 API listening on :${port} (NODE_ENV=${process.env.NODE_ENV || 'dev'})`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    try {
      console.log(`\n🧹 Received ${signal}, closing gracefully…`);
      if (server) {
        await new Promise<void>((resolve) => server!.close(() => resolve()));
        console.log('🛑 HTTP server closed');
      }
      await mongoose.connection.close();
      console.log('🔒 Mongo connection closed');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((e) => {
  console.error('❌ Server start error:', e);
  process.exit(1);
});
