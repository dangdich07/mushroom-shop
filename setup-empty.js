// Tạo cấu trúc dự án Mushroom Shop – chỉ tạo file rỗng & .gitkeep
// Chạy: node setup-empty.js
const fs = require('fs');
const path = require('path');

const touch = (p) => {
  const dir = path.dirname(p);
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, '');
    console.log('✔ file  ', p);
  } else {
    console.log('• exist ', p);
  }
};

const keep = (dir) => {
  const p = path.join(dir, '.gitkeep');
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, '');
    console.log('✔ dir   ', dir, '(+ .gitkeep)');
  } else {
    console.log('• exist ', dir);
  }
};

// === Danh sách file rỗng cần tạo ===
const files = [
  // gốc
  '.gitignore',
  '.dockerignore',
  'README.md',
  'LICENSE',
  'package.json',
  'turbo.json',
  'docker-compose.yml',
  'infra.docker-compose.yml',
  '.env.example',

  // GitHub Actions
  '.github/workflows/ci.yml',
  '.github/workflows/dast-zap.yml',

  // VS Code
  '.vscode/extensions.json',
  '.vscode/settings.json',

  // apps/api – Express (MVC)
  'apps/api/Dockerfile',
  'apps/api/package.json',
  'apps/api/tsconfig.json',
  'apps/api/jest.config.ts',
  'apps/api/src/app.ts',
  'apps/api/src/server.ts',
  'apps/api/src/config/env.ts',
  'apps/api/src/config/logger.ts',
  'apps/api/src/middlewares/security.ts',
  'apps/api/src/middlewares/auth.ts',
  'apps/api/src/middlewares/rbac.ts',
  'apps/api/src/middlewares/error.ts',
  'apps/api/src/validators/auth.schema.ts',
  'apps/api/src/validators/product.schema.ts',
  'apps/api/src/validators/order.schema.ts',
  'apps/api/src/validators/review.schema.ts',
  'apps/api/src/models/user.model.ts',
  'apps/api/src/models/product.model.ts',
  'apps/api/src/models/sku.model.ts',
  'apps/api/src/models/cart.model.ts',
  'apps/api/src/models/order.model.ts',
  'apps/api/src/models/review.model.ts',
  'apps/api/src/models/coupon.model.ts',
  'apps/api/src/models/webhook.model.ts',
  'apps/api/src/models/audit-log.model.ts',
  'apps/api/src/repositories/product.repo.ts',
  'apps/api/src/repositories/order.repo.ts',
  'apps/api/src/repositories/user.repo.ts',
  'apps/api/src/services/auth.service.ts',
  'apps/api/src/services/product.service.ts',
  'apps/api/src/services/order.service.ts',
  'apps/api/src/services/cart.service.ts',
  'apps/api/src/services/review.service.ts',
  'apps/api/src/services/coupon.service.ts',
  'apps/api/src/services/webhook.service.ts',
  'apps/api/src/controllers/auth.controller.ts',
  'apps/api/src/controllers/product.controller.ts',
  'apps/api/src/controllers/order.controller.ts',
  'apps/api/src/controllers/cart.controller.ts',
  'apps/api/src/controllers/review.controller.ts',
  'apps/api/src/controllers/admin.controller.ts',
  'apps/api/src/controllers/webhook.controller.ts',
  'apps/api/src/routes/index.ts',
  'apps/api/src/routes/auth.route.ts',
  'apps/api/src/routes/products.route.ts',
  'apps/api/src/routes/cart.route.ts',
  'apps/api/src/routes/orders.route.ts',
  'apps/api/src/routes/reviews.route.ts',
  'apps/api/src/routes/admin.route.ts',
  'apps/api/src/utils/stripe.ts',
  'apps/api/src/utils/idempotency.ts',
  'apps/api/src/utils/pagination.ts',
  'apps/api/src/utils/sanitize.ts',
  'apps/api/src/utils/types.ts',
  'apps/api/src/tests/unit/product.service.test.ts',
  'apps/api/src/tests/unit/order.service.test.ts',
  'apps/api/src/tests/integration/auth.route.test.ts',
  'apps/api/src/tests/integration/orders.route.test.ts',

  // apps/web – Next.js (View)
  'apps/web/Dockerfile',
  'apps/web/package.json',
  'apps/web/next.config.ts',
  'apps/web/tsconfig.json',
  'apps/web/jest.config.ts',
  'apps/web/playwright.config.ts',
  'apps/web/app/layout.tsx',
  'apps/web/app/page.tsx',
  'apps/web/app/(catalog)/products/page.tsx',
  'apps/web/app/(catalog)/products/[slug]/page.tsx',
  'apps/web/app/(account)/login/page.tsx',
  'apps/web/app/(account)/register/page.tsx',
  'apps/web/app/(account)/orders/[id]/page.tsx',
  'apps/web/app/(cart)/page.tsx',
  'apps/web/app/(checkout)/page.tsx',
  'apps/web/app/api/auth/[...nextauth]/route.ts',
  'apps/web/app/sitemap.xml/route.ts',
  'apps/web/components/ui/.keep',          // sẽ thay bằng .gitkeep qua keep() ở dưới
  'apps/web/components/product/.keep',
  'apps/web/components/layout/.keep',
  'apps/web/hooks/.keep',
  'apps/web/lib/api.ts',
  'apps/web/lib/auth.ts',
  'apps/web/lib/seo.ts',
  'apps/web/public/.keep',
  'apps/web/styles/globals.css',
  'apps/web/tests/e2e/checkout.spec.ts',
  'apps/web/tests/unit/components.test.tsx',

  // config & tooling
  'config/eslint/.eslintrc.base.cjs',
  'config/jest/jest.base.config.ts',
  'config/tsconfig/base.json',
  'config/tsconfig/web.json',
  'config/tsconfig/api.json',
  'config/semgrep/semgrep.yml',

  // docs
  'docs/architecture.md',
  'docs/api.md',
  'docs/security.md',
  'docs/logging_graylog.md',
  'docs/snort_lab.md',
  'docs/stripe_webhook.md',
  'docs/IR_playbook.md',

  // infra/nginx + CRS
  'infra/nginx/Dockerfile',
  'infra/nginx/nginx.conf',
  'infra/nginx/modsecurity.conf',
  'infra/nginx/crs-setup.conf',
  'infra/nginx/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf',

  // infra/snort
  'infra/snort/Dockerfile',
  'infra/snort/snort.conf',
  'infra/snort/rules/local.rules',

  // infra/graylog
  'infra/graylog/README.md',

  // packages
  'packages/ui/.keep',
  'packages/config/.keep',

  // scripts
  'scripts/migrate.ts',
  'scripts/seed.ts',
  'scripts/k6/smoke.js',
  'scripts/k6/load.js',
  'scripts/zap-baseline.sh',

  // IaC
  'iac/terraform/.keep',
];

// Thư mục cần .gitkeep (để theo dõi thư mục rỗng)
const keepDirs = [
  'apps/web/components/ui',
  'apps/web/components/product',
  'apps/web/components/layout',
  'apps/web/hooks',
  'apps/web/public',
  'infra/snort/pcap',
  'infra/graylog/dashboards',
  'infra/graylog/pipelines',
  'packages/ui',
  'packages/config',
  'iac/terraform'
];

files.forEach((f) => {
  if (f.endsWith('/.keep')) {
    // sẽ thay thế .keep bằng .gitkeep
    const dir = f.replace(/\/\.keep$/, '');
    keep(dir);
  } else {
    touch(f);
  }
});

keepDirs.forEach(keep);

console.log('\nDone. Toàn bộ khung dự án (file rỗng) đã tạo xong.');
