# Ohdah Asset Management Platform (منصة عهدة)

<p align="center">
  <img src="https://img.shields.io/badge/Ohdah-Asset%20Management-0B1F3A?style=for-the-badge" alt="Ohdah Platform">
  <img src="https://img.shields.io/badge/RTL-Arabic%20Platform-D4AF37?style=for-the-badge" alt="RTL">
  <img src="https://img.shields.io/badge/Full%20Stack-React%2019%20%2B%20NestJS%2011-61DAFB?style=for-the-badge" alt="Full Stack">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-14%2B-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
</p>

---

## 📌 نبذة عن المشروع (Project Overview)

**منصة عهدة (Ohdah)** هي نظام متكامل لإدارة الأصول والعهد المؤسسية مصمم خصيصاً للمؤسسات والشركات لتنظيم وتتبع حركة الأصول والعهد الشخصية للموظفين، وتوثيق طلبات التسليم والإرجاع والصيانة إلكترونياً وبواجهة عربية كاملة (RTL).

النظام يوفر إدارة مركزية لكل من:
- **سجل الأصول والتصنيفات (Asset Inventory):** تسجيل وتصنيف وتتبع حالة الأصول المؤسسية.
- **إسناد العهد وإرجاعها (Custody Tracking):** إسناد العهد للموظفين، توثيق تاريخ الاستلام والإرجاع، وإدارة طلبات العهد.
- **طلبات الصيانة (Maintenance Management):** تسجيل بلاغات الصيانة، تحديد الأولويات، ومتابعة التنفيذ والتكاليف.
- **إدارة المستخدمين والصلاحيات (RBAC):** التحكم في الوصول وفق الأدوار الوظيفية (`ADMIN`, `ASSET_MANAGER`, `EMPLOYEE`).
- **الإشعارات النظامية (Notifications):** تنبيهات تفاعلية للمستخدمين حول تحديثات طلباتهم والعهد المسندة إليهم.
- **التقارير وسجلات التدقيق (Reports & Audit Logs):** ملخصات الأصول، تقارير الصيانة، ومتابعة العمليات.

---

## 🎯 أهداف المشروع (Project Objectives)

- أتمتة دورة حياة العهد والأصول المؤسسية بالكامل.
- تقليل الأخطاء الناتجة عن التتبع اليدوي أو الورقي.
- تعزيز المسؤولية والشفافية بين الموظفين ومسؤولي العهد.
- عزل بيانات المؤسسات المتعددة (Multi-Tenant Isolation) بدقة وأمان.
- توفير تجربة مستخدم عربية احترافية سريعة ومتجاوبة.

---

## 👥 الأدوار ومسارات الاستخدام (Users & Roles)

### 1. الموظف (Employee)
- استعراض الأصول المتاحة في المؤسسة.
- تقديم طلبات استلام عهدة جديدة ومتابعة حالتها.
- عرض العهد الحالية المسندة إليه وتفاصيلها.
- تقديم طلبات إرجاع العهدة أو بلاغات صيانة للأصول التالفة.
- استلام إشعارات فورية عند الموافقة أو الرفض أو التحديث.

### 2. مسؤول العهد والأصول (Asset Manager)
- إدارة جرد الأصول وتصنيفاتها وإضافة أصول جديدة.
- مراجعة طلبات العهد المقدمة من الموظفين (الموافقة أو الرفض مع ذكر الأسباب).
- إسناد الأصول مباشرة وإتمام إجراءات الإرجاع بعد التحقق من حالتها.
- متابعة طلبات وبلاغات الصيانة وتحديد الفنيين والتكاليف.
- استعراض التقارير الإحصائية لحالة الأصول والصيانة.

### 3. مدير النظام (System Administrator)
- إدارة حسابات المستخدمين والموظفين والأقسام.
- التحكم بالأدوار والصلاحيات (Permissions Matrix).
- مراقبة سجلات التدقيق (Audit Logs) لجميع العمليات الحساسة.
- ضبط الإعدادات العامة للمؤسسة.

---

## 🏗️ بنية المشروع (Project Structure)

المشروع مبني كـ Full-Stack Monorepo يحتوي على الواجهة الأمامية في الجذر (Root) وخدمات الواجهة الخلفية في مجلد `backend`:

```
ohdah/
├── src/                                  # الواجهة الأمامية (React 19 + TypeScript)
│   ├── assets/                           # الصور والشعارات
│   ├── components/                       # المكونات المشتركة وقوائم التنقل
│   ├── context/                          # سياق المصادقة (AuthContext)
│   ├── features/                         # وحدات الأعمال (Assets, Custody, Maintenance, ...)
│   ├── hooks/                            # الخطافات المخصصة (useEmployee, useDebounce, ...)
│   ├── layouts/                          # قوالب الصفحات بحسب الدور (Admin, AssetManager, Portal)
│   ├── pages/                            # صفحات التطبيق
│   ├── services/                         # خدمات الاتصال بالخادم و Axios Interceptor
│   └── types/                            # التعريفات ونماذج البيانات
├── package.json                          # إعدادات وتبعية الواجهة الأمامية وأوامر التشغيل المشتركة
├── vite.config.ts                        # إعدادات بناء Vite
├── tailwind.config.ts                    # إعدادات Tailwind CSS والسمات اللونية
├── .env.example                          # نموذج متغيرات بيئة الواجهة الأمامية
│
├── backend/                              # الواجهة الخلفية (NestJS 11 + Prisma ORM)
│   ├── prisma/                           # ملفات Schema والتهجير (Migrations) وبذور البيانات
│   │   ├── schema.prisma                 # نموذج قاعدة البيانات العلائقية
│   │   ├── migrations/                   # سجل تهجيرات SQL المتسلسلة
│   │   └── seed.ts                       # سكريبت بذور البيانات لبيئة التطوير
│   ├── src/                              # شيفرة الواجهة الخلفية
│   │   ├── assets/                       # وحدة إدارة الأصول والتصنيفات
│   │   ├── auth/                         # وحدة المصادقة وإدارة الجلسات و Rate Limiting
│   │   ├── custody/                      # وحدة إدارة طلبات وسجلات العهد
│   │   ├── employees/                    # وحدة إدارة بيانات الموظفين
│   │   ├── maintenance/                  # وحدة إدارة طلبات الصيانة
│   │   ├── notifications/                # وحدة الإشعارات
│   │   ├── reports/                      # وحدة التقارير والإحصاءات
│   │   ├── users/                        # وحدة إدارة المستخدمين والأدوار
│   │   └── prisma/                       # خدمة الاتصال بقاعدة البيانات
│   ├── test/                             # الاختبارات الآلية (Unit, Integration, Security)
│   ├── package.json                      # تبعيات وأوامر تشغيل الواجهة الخلفية
│   └── .env.example                      # نموذج متغيرات بيئة الواجهة الخلفية
│
├── API_DOCUMENTATION.md                  # التوثيق التفصيلي لنقاط النهاية (REST API)
├── SYSTEM_ARCHITECTURE.md                # وثيقة البنية المعمارية ونموذج الأمان
└── README.md                             # هذا الملف
```

---

## ⚙️ متطلبات التشغيل (System Requirements)

- **Node.js:** الإصدار 20 أو أحدث (موصى به v20.x أو v24.x LTS).
- **PostgreSQL:** الإصدار 14 أو أحدث (يعمل افتراضياً على المنفذ `5432`).
- **npm:** مدير الحزم الافتراضي لـ Node.js.

---

## 🚀 التثبيت والتشغيل المحلي (Setup & Local Run)

### الخطوة 1: تثبيت تبعيات الواجهة الأمامية والجذر

من المجلد الرئيسي للمشروع (`C:\xampp\htdocs\ohdah`):

```bash
# تثبيت حزم الواجهة الأمامية
npm install

# إعداد ملف البيئة للواجهة الأمامية
cp .env.example .env
```

محتوى ملف `.env` للواجهة الأمامية:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ORGANIZATION_ID=11111111-1111-4111-8111-111111111111
```

---

### الخطوة 2: تثبيت وإعداد الواجهة الخلفية وقاعدة البيانات

في نافذة طرفية أخرى أو بعد الانتقال لمجلد `backend`:

```bash
cd backend

# تثبيت حزم الواجهة الخلفية
npm install

# إعداد ملف البيئة للواجهة الخلفية
cp .env.example .env
```

قم بفتح `backend/.env` وتعديل بيانات الاتصال بقاعدة البيانات ومفاتيح JWT السرية:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ohdah?schema=public"
JWT_ACCESS_SECRET="YOUR_LONG_RANDOM_ACCESS_SECRET_KEY"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="YOUR_LONG_RANDOM_REFRESH_SECRET_KEY"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

توليد عميل Prisma وتطبيق التهجيرات:
```bash
# توليد Prisma Client
npm run prisma:generate

# التحقق من صحة Schema
npm run prisma:validate

# تطبيق التهجيرات على قاعدة البيانات المحلية (عند توفر خدمة PostgreSQL)
# ملاحظة: تأكد من تشغيل خدمة PostgreSQL محلياً أولاً
npm run prisma:migrate

# تعبئة بيانات الاختبار الأولية (بيئة التطوير فقط)
npm run prisma:seed
```

> [!WARNING]
> سكريبت `prisma:seed` محمي برمجياً وممنوع من العمل تماماً في بيئة الإنتاج (`NODE_ENV=production`).

---

### الخطوة 3: تشغيل بيئة التطوير

**الخيار الأول (الموصى به - تشغيل الواجهة الأمامية والخلفية معاً من الجذر):**
```bash
npm run dev
```

**الخيار الثاني (تشغيل كل خادم على حدة):**
- لتشغيل الواجهة الأمامية (على المنفذ `5173`):
  ```bash
  npm run dev:frontend
  ```
- لتشغيل خادم الواجهة الخلفية (على المنفذ `3000`):
  ```bash
  npm run dev:backend
  # أو من داخل مجلد backend:
  cd backend && npm run start:dev
  ```

---

## 🔐 بيانات الدخول الافتراضية (بيئة التطوير فقط)

عند تشغيل سكريبت `seed` في بيئة التطوير، يتم تجهيز الحسابات التالية:

| الدور (Role) | البريد الإلكتروني | كلمة المرور |
| :--- | :--- | :--- |
| **مدير النظام (Admin)** | `admin@ohdah.local` | `ChangeMe123!` |
| **مسؤول العهد (Asset Manager)** | `asset.manager@ohdah.local` | `ChangeMe123!` |
| **موظف (Employee)** | `employee1@ohdah.local` | `ChangeMe123!` |

> [!IMPORTANT]
> يجب تغيير كلمات المرور ومفاتيح JWT السرية فوراً عند الانتقال لأي بيئة خارج بيئة التطوير المحلية.

---

## 🛡️ الميزات الأمنية المطبقة فعلياً (Implemented Security Features)

- **تدوير رموز التحديث (Refresh Token Rotation):** إصدار رمز تحديث مشفر (Opaque SHA-256 Token) يُلغى فور استخدامه ويستبدل برمز جديد مع كل دورة تحديث.
- **كشف هجمات إعادة الاستخدام (Replay Attack Detection):** في حال محاولة استخدام رمز تحديث ملغي مسبقاً، يلغي النظام فورياً جميع جلسات المستخدم النشطة ويزيد رقم إصدار الرمز.
- **إلغاء صلاحية الجلسات الفوري (Token Versioning):** دعم حقل `tokenVersion` على جدول المستخدم، مما يمكن من الإلغاء اللحظي لكافة الرموز الصادرة فور تسجيل الخروج من كافة الأجهزة أو تغيير كلمة المرور.
- **تنسيق التحديث بين التبويبات (Cross-Tab Coordination):** دعم Web Locks API في المتصفح لمنع تضارب طلبات التحديث المتزامنة عبر أكثر من تبويب.
- **عزل بيانات المؤسسات (Multi-Tenant Isolation):** يتم استخراج `organizationId` حصرياً من رمز JWT المعتمد، ولا يمكن للمستخدم الوصول لبيانات مؤسسة أخرى حتى لو تلاعب ببيانات الطلب (Anti-IDOR).
- **التحكم بالوصول القائم على الأدوار (RBAC):** حماية كافة المسارات عبر `JwtAuthGuard` و `RolesGuard` و `PermissionsGuard`.
- **الحد من معدل الطلبات (Rate Limiting):** حماية مسارات الدخول والتسجيل والتحديث من هجمات القوة الغاشمة (Brute Force).
- **ترويس الأمان و CORS:** إعدادات صارمة لـ CORS وترويسات الأمان (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `HSTS`, `Referrer-Policy`).

---

## 🧪 الفحص والاختبارات الآلية (Testing & Validation)

### فحص الواجهة الخلفية (Backend)
من داخل مجلد `backend`:
```bash
cd backend

# التحقق من صحة مخطط قاعدة البيانات
npm run prisma:validate

# فحص الأخطاء والتنسيق البرمجي
npm run lint

# تشغيل حزمة الاختبارات الآلية
npm test

# تجربة بناء الإنتاج
npm run build
```

### فحص الواجهة الأمامية (Frontend)
من الجذر:
```bash
# فحص ESLint
npm run lint

# اختبار بناء الإنتاج والتحقق من الأنواع (TypeScript Check + Vite Build)
npm run build
```

---

## ⚠️ القيود والميزات غير المكتملة (Limitations & Current Scope)

بكل دقة وشفافية برمجية، يرجى ملاحظة الآتي حول الوضع الراهن للمشروع:
1. **DPoP (Demonstrating Proof-of-Possession):** **غير مطبق** في المشروع حالياً. الحماية المعتمدة هي Refresh Token Rotation + SHA-256 Hash + Token Versioning + Short-lived Bearer JWT.
2. **اختبارات تكامل قاعدة البيانات المباشرة (Live DB Integration):** يتطلب ملف الاختبار `auth-postgres-integration.spec.ts` تشغيل خدمة PostgreSQL محلياً على المنفذ `5432`؛ وفي حال توقف الخدمة يتم تخطي الاختبارات الحقيقية بأمان مع طباعة إشعار توضيحي.
3. **اختبارات الواجهة الأمامية (Frontend Tests):** لا توجد حزمة اختبارات وحدة آلية (مثل Vitest أو Jest) معدة مسبقاً للواجهة الأمامية في `package.json` الرئيسي، ويعتمد الفحص الحالي على `eslint` و `tsc -b`.
4. **تقسيم الحزم الكبيرة (Code Splitting):** يُظهر بناء Vite تحذيراً حول تجاوز ملف `index.js` حاجز 500 kB، ويوصى في المراحل القادمة باعتماد Lazy Loading للصفحات.

---

## 🎓 الاعتماد الأكاديمي (Academic Affiliation)

تم تطوير هذا المشروع كجزء من **معسكر البرمجة السريعة (Vibe Coding Course)** لدى **أكاديمية سدايا (SDAIA Academy)**.

<p align="center">
  <a href="https://github.com/SDAIAAcademy">
    <img src="https://img.shields.io/badge/SDAIA%20Academy-GitHub-181717?style=for-the-badge&logo=github" alt="SDAIA Academy on GitHub">
  </a>
</p>

---

## 👨‍💻 فريق العمل (Project Team)

<div align="center">

| المطور | حساب GitHub |
| :--- | :--- |
| **فارس المشرفي (Faris Almushrafi)** | [@csifaris](https://github.com/csifaris) |
| **خالد صالح (Khalid Saleh)** | [@khaledsaleh1424-sudo](https://github.com/khaledsaleh1424-sudo) |
| **سلمان الحماد (Salman Alhammad)** | [@engalhammad](https://github.com/engalhammad) |
| **رنا الزهراني (Rana Alzhrani)** | [@RiixR1](https://github.com/RiixR1) |
| **رند العنزي (Rand Alanazi)** | [@nra27158-ship-it](https://github.com/nra27158-ship-it) |
| **رائد الحربي (Raeed Alharbi)** | [@RaeedAlharbi](https://github.com/RaeedAlharbi) |
| **عفاف المطيري (Afaf AlMutairi)** | [@Afafbader999](https://github.com/Afafbader999) |

</div>

---

## 📄 الوثائق الإضافية (Documentation)

- [توثيق واجهة برمجة التطبيقات (API Documentation)](API_DOCUMENTATION.md)
- [وثيقة البنية المعمارية والأمان (System Architecture)](SYSTEM_ARCHITECTURE.md)
