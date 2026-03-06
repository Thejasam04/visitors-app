# 🏢 VisitorPass

> A full-stack visitor management system built on AWS with a 3-tier architecture, automated CI/CD pipeline, and Infrastructure as Code using Terraform.



---

##  What is VisitorPass?

VisitorPass is a production-grade visitor management platform that digitizes the process of requesting, approving, and tracking office visits. Visitors submit requests online, hosts receive email approvals with time-window controls, and approved visitors receive a QR-coded digital pass — all managed through a real-time admin dashboard.

---

## 🏗 Architecture

### 3-Tier AWS Architecture

```
                          ┌─────────────────────────────────────────┐
                          │              INTERNET                    │
                          └──────────────────┬──────────────────────┘
                                             │
                          ┌──────────────────▼──────────────────────┐
                          │        Application Load Balancer         │
                          │         (myapp-dev-alb) HTTP:80          │
                          └──────────────────┬──────────────────────┘
                                             │
                    ┌────────────────────────▼────────────────────────┐
                    │                  PRESENTATION TIER               │
                    │              EC2 + Nginx (Port 80)               │
                    │         React/Vite SPA → /var/www/visitorpass    │
                    └────────────────────────┬────────────────────────┘
                                             │ /api/* proxy
                    ┌────────────────────────▼────────────────────────┐
                    │                  APPLICATION TIER                │
                    │           Node.js + Express (Port 5000)          │
                    │    Auth · Visitors · Hosts · Approvals · QR     │
                    └────────────────────────┬────────────────────────┘
                                             │
                    ┌────────────────────────▼────────────────────────┐
                    │                    DATA TIER                     │
                    │            Amazon RDS (MySQL 8.0)                │
                    │         Private Subnet · No public access        │
                    └─────────────────────────────────────────────────┘

  Supporting Services:
  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
  │  Amazon S3   │   │  Amazon SES  │   │  AWS SSM     │
  │ Photo Upload │   │ Email Notify │   │ Remote Deploy│
  └──────────────┘   └──────────────┘   └──────────────┘
```

### Network Layout

```
VPC (10.0.0.0/16)
├── Public Subnet  (10.0.1.0/24)  → EC2, ALB
└── Private Subnet (10.0.2.0/24)  → RDS MySQL
```

---

## ⚙️ Infrastructure as Code — Terraform

All AWS infrastructure is provisioned using Terraform. No manual console setup.

```
terraform/
├── main.tf          # VPC, Subnets, IGW, Route Tables
├── ec2.tf           # EC2 instance, Security Groups, IAM Role
├── rds.tf           # RDS MySQL, DB Subnet Group
├── alb.tf           # ALB, Target Group, Listener
├── s3.tf            # S3 bucket for photo uploads
├── variables.tf     # Input variables
└── outputs.tf       # ALB DNS, RDS endpoint
```

### Key Terraform Resources

| Resource | Description |
|----------|-------------|
| `aws_vpc` | Custom VPC with DNS support |
| `aws_subnet` | Public + Private subnets across AZs |
| `aws_internet_gateway` | IGW for public internet access |
| `aws_security_group` | EC2 (80, 5000, 22), RDS (3306 internal only) |
| `aws_instance` | EC2 t2.micro with SSM agent + IAM role |
| `aws_db_instance` | RDS MySQL 8.0 in private subnet |
| `aws_lb` | Application Load Balancer |
| `aws_lb_target_group` | Target group with health checks |
| `aws_s3_bucket` | Photo storage with private ACL |
| `aws_iam_role` | EC2 role with SSM + S3 + SES permissions |

### Deploy Infrastructure

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

---

## 🚀 CI/CD Pipeline — GitHub Actions

Every push to `main` automatically builds and deploys the full stack to EC2 using **AWS SSM** (no SSH keys required).

### Pipeline Flow

```
git push origin main
        │
        ▼
┌───────────────────┐
│  GitHub Actions   │
│  ubuntu-latest    │
└────────┬──────────┘
         │
         ▼
┌───────────────────────────────────────┐
│  AWS SSM Send-Command to EC2          │
│                                       │
│  1. git pull (latest code)            │
│  2. npm install (backend)             │
│  3. npm install (frontend)            │
│  4. npm run build (Vite → dist/)      │
│  5. cp dist/ → /var/www/visitorpass   │
│  6. systemctl restart nodeapp         │
│  7. systemctl reload nginx            │
└───────────────────────────────────────┘
         │
         ▼
┌───────────────────┐
│   Live on ALB     │
│   ~2 min deploy   │
└───────────────────┘
```

### Why SSM instead of SSH?

- ✅ No SSH key management
- ✅ No port 22 open on EC2
- ✅ Audit trail via AWS CloudTrail
- ✅ IAM-based access control

---

## ✨ Features

### Visitor Side
- 📝 Submit visit requests with photo upload
- 📧 Receive QR-coded digital pass via email on approval
- 📊 Personal dashboard — track all visits and statuses
- 🎫 View and share digital visitor pass

### Host Side
- 📬 Email notification on new visit request
- ✅ Approve with custom time window (start → end time)
- ❌ Reject with automatic visitor notification

### Admin Panel
- 📊 Real-time dashboard — total visitors, pending, checked-in
- 👥 All Visitors — search, filter by status/date, approve/reject inline
- 🏠 Hosts Management — full CRUD with department management
- 📈 Reports — visitors by date (bar chart), status (donut), host (bar), CSV export

---

## 🛠 Tech Stack

### Frontend
| Tech | Usage |
|------|-------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router | Client-side routing |
| Axios | API calls |
| Custom CSS | No UI library — fully custom dark theme |

### Backend
| Tech | Usage |
|------|-------|
| Node.js + Express | REST API |
| MySQL2 | Database driver |
| JWT | Authentication |
| Nodemailer + AWS SES | Email delivery |
| QRCode | QR pass generation |
| Multer + AWS S3 | Photo upload |

### Infrastructure
| Tech | Usage |
|------|-------|
| Terraform | Infrastructure as Code |
| AWS EC2 | App server |
| AWS RDS (MySQL) | Database |
| AWS ALB | Load balancer |
| AWS S3 | File storage |
| AWS SES | Email service |
| AWS SSM | Secure remote execution |
| Nginx | Reverse proxy + static file serving |
| PM2 | Node process manager |
| GitHub Actions | CI/CD pipeline |

---

## 📁 Project Structure

```
visitors-app/
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD pipeline
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── visitor/      # Landing, Auth, VisitForm, Dashboard, Pass
│   │   │   └── admin/        # Login, Dashboard, Hosts, Visitors, Reports
│   │   ├── services/
│   │   │   └── api.js        # Axios instance + all API calls
│   │   └── App.jsx           # Routes
│   └── vite.config.js
├── backend/
│   ├── routes/
│   │   ├── visitors.js       # Visit CRUD + check-in/out
│   │   ├── hosts.js          # Host management
│   │   ├── approval.js       # Approve/reject flow
│   │   ├── admin.js          # Admin auth + reports
│   │   └── auth.js           # JWT auth
│   ├── services/
│   │   ├── email.js          # SES email templates
│   │   ├── qrcode.js         # QR generation
│   │   └── s3.js             # Photo upload
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   └── server.js
└── terraform/
    ├── main.tf
    ├── ec2.tf
    ├── rds.tf
    └── alb.tf
```

---

## 🔄 Key Flows

### Visitor Approval Flow
```
Visitor submits form
      │
      ▼
Backend saves to DB (status: pending)
      │
      ▼
Email sent to Host (approve/reject links)
      │
      ├── Host clicks Approve
      │         │
      │         ▼
      │   Host sets time window
      │         │
      │         ▼
      │   QR code generated
      │         │
      │         ▼
      │   Visitor pass emailed to visitor
      │
      └── Host clicks Reject
                │
                ▼
          Rejection email sent to visitor
```

---

## 🏃 Local Setup

### Prerequisites
- Node.js 18+
- MySQL 8
- AWS account (for S3, SES)

### Backend
```bash
cd backend
cp .env.example .env
# Fill in DB, JWT, AWS credentials
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

### Environment Variables

**Backend `.env`**
```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_SES_FROM=
S3_BUCKET_NAME=
```

**Frontend `.env`**
```env
VITE_API_URL=http://localhost:5000
```

---

## 📸 Screenshots

> _Add screenshots here_

| Page | Description |
|------|-------------|
| `/` | Landing page |
| `/auth` | Login / Register |
| `/visit` | Visit request form |
| `/dashboard` | Visitor dashboard |
| `/pass/:id` | Digital visitor pass with QR |
| `/admin` | Admin login |
| `/admin/dashboard` | Admin overview |

---

## 👤 Author

**Thejas** — Full Stack Developer  
Building production systems on AWS with modern DevOps practices.

[![GitHub](https://img.shields.io/badge/GitHub-Thejasam04-181717?style=flat&logo=github)](https://github.com/Thejasam04)

---

> _This project demonstrates end-to-end ownership — from Terraform infrastructure provisioning to React UI, Node.js APIs, AWS integrations, and automated CI/CD deployment._
