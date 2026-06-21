# 化工厂受限空间作业票管理系统

## 系统概述

本系统用于化工厂受限空间作业的安全管理，将气体检测、监护人、能量隔离和复工确认整合在同一张作业票中，实现全流程电子化审批和安全管控。

## 技术栈

### 后端
- **Spring Boot 3.2.0**
- **Spring State Machine 4.0.0** - 状态机管理
- **Spring Data JPA** - 数据持久化
- **PostgreSQL** - 数据库
- **Java 17**

### 前端
- **React 18**
- **TypeScript**
- **Ant Design 5** - UI 组件库
- **React Router 6** - 路由管理
- **Vite** - 构建工具
- **Axios** - HTTP 客户端
- **Day.js** - 日期处理

## 业务流程

### 作业票生命周期

```
草稿(DRAFT) → 待审批(PENDING_APPROVAL) → 待气体检测(GAS_TEST_PENDING)
    → 待隔离确认(ISOLATION_PENDING) → 准备开工(READY_TO_START)
    → 作业中(IN_PROGRESS) → 待复工确认(PENDING_RESUME)
    → 复工已确认(RESUME_CONFIRMED) → 关闭中(CLOSING) → 已关闭(CLOSED)
```

### 核心业务规则

1. **气体检测过期不能开工**：开工前必须确保气体检测在有效期内（默认8小时）
   - 氧含量合格范围：19.5% - 23.5%
   - 可燃气体合格：< 10% LEL

2. **能量隔离未确认不能进入**：所有隔离点必须全部确认后才能开始作业

3. **人员未全部签出不能关闭作业票**：关闭作业票前必须确认所有人员已安全撤出

4. **进出人员必须由监护人确认**：所有进入受限空间的人员必须由监护人登记

### 角色职责

| 角色 | 职责 |
|------|------|
| **申请人** | 填写设备和作业内容，创建并提交作业票 |
| **审批人** | 审核作业票内容，决定是否批准 |
| **安全员** | 录入氧含量及可燃气体检测数据 |
| **监护人** | 确认并登记进出人员 |
| **作业负责人** | 确认能量隔离点，开始作业，确认复工 |

## 数据库设计

### 核心数据表

1. **work_permit** - 作业票主表
   - 存储作业票基本信息、状态、时间

2. **gas_detection** - 气体检测表
   - 存储每次气体检测数据：氧含量、可燃气体、有毒气体
   - 每次检测默认有效期8小时

3. **isolation_point** - 能量隔离点表
   - 存储需要隔离的位置和措施
   - 记录确认人和确认时间

4. **personnel_entry** - 人员进出记录表
   - 记录每个人员的进入和撤出时间
   - 跟踪当前在受限空间内的人员

5. **approval_record** - 审批记录表
   - 完整记录所有操作历史和状态变更

## 项目结构

```
.
├── database/
│   └── init.sql              # 数据库初始化脚本
├── backend/                   # Spring Boot 后端
│   ├── src/main/java/com/chemical/workpermit/
│   │   ├── WorkPermitApplication.java
│   │   ├── config/           # 配置类（状态机、CORS）
│   │   ├── controller/       # REST API 控制器
│   │   ├── service/          # 业务逻辑层
│   │   ├── repository/       # 数据访问层
│   │   ├── entity/           # JPA 实体类
│   │   ├── dto/              # 数据传输对象
│   │   ├── enums/            # 枚举类
│   │   └── exception/        # 异常处理
│   └── src/main/resources/
│       └── application.yml   # 应用配置
└── frontend/                  # React 前端
    ├── src/
    │   ├── components/       # 可复用组件
    │   ├── pages/            # 页面组件
    │   ├── services/         # API 服务
    │   ├── types/            # TypeScript 类型定义
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## 快速开始

### 1. 数据库初始化

```bash
# 创建数据库
createdb work_permit

# 执行初始化脚本
psql -d work_permit -f database/init.sql
```

### 2. 启动后端

```bash
cd backend

# 修改 application.yml 中的数据库连接配置

# 编译启动
mvn spring-boot:run

# 后端服务将在 http://localhost:8080 启动
```

### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 前端将在 http://localhost:3000 启动
```

## API 接口说明

### 作业票管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/work-permits` | 获取作业票列表 |
| GET | `/api/work-permits/{id}` | 获取作业票详情 |
| POST | `/api/work-permits` | 创建作业票 |
| POST | `/api/work-permits/{id}/submit` | 提交审批 |
| POST | `/api/work-permits/{id}/approve` | 审批通过 |
| POST | `/api/work-permits/{id}/reject` | 驳回 |
| POST | `/api/work-permits/{id}/gas-detection` | 录入气体检测 |
| POST | `/api/work-permits/{id}/isolation-points` | 添加隔离点 |
| POST | `/api/work-permits/{id}/isolation-points/{pointId}/confirm` | 确认隔离点 |
| POST | `/api/work-permits/{id}/start` | 开始作业 |
| POST | `/api/work-permits/{id}/personnel/entry` | 登记人员进入 |
| POST | `/api/work-permits/{id}/personnel/exit` | 登记人员撤出 |
| POST | `/api/work-permits/{id}/confirm-resume` | 确认复工 |
| POST | `/api/work-permits/{id}/close` | 关闭作业票 |
| POST | `/api/work-permits/{id}/cancel` | 取消作业票 |

## 状态机配置

系统使用 Spring State Machine 管理作业票状态流转，确保状态变更的合法性和一致性。

### 状态流转规则

| 当前状态 | 事件 | 目标状态 |
|----------|------|----------|
| DRAFT | SUBMIT | PENDING_APPROVAL |
| PENDING_APPROVAL | APPROVE | GAS_TEST_PENDING |
| PENDING_APPROVAL | REJECT | DRAFT |
| GAS_TEST_PENDING | RECORD_GAS_TEST | ISOLATION_PENDING |
| ISOLATION_PENDING | CONFIRM_ISOLATION | READY_TO_START |
| READY_TO_START | START_WORK | IN_PROGRESS |
| IN_PROGRESS | RECORD_EXIT (全部撤出) | PENDING_RESUME |
| PENDING_RESUME | CONFIRM_RESUME | RESUME_CONFIRMED |
| RESUME_CONFIRMED | START_WORK | IN_PROGRESS |
| RESUME_CONFIRMED | CLOSE | CLOSED |
| IN_PROGRESS | CLOSE | CLOSED |

## 业务规则校验点

1. **开工前校验**
   - 气体检测是否过期
   - 所有隔离点是否已确认

2. **人员进入校验**
   - 气体检测是否过期
   - 作业票是否处于作业中状态
   - 人员是否已在里面

3. **关闭作业票校验**
   - 所有人员是否已撤出

## 安全特性

- 所有操作都有完整的审批日志
- 状态机确保操作的合法性
- 版本控制（@Version）防止并发修改冲突
- CORS 配置支持跨域访问
- 全局异常处理，统一错误格式

## 扩展建议

1. **用户认证**：集成 Spring Security 实现登录认证
2. **权限控制**：基于角色的访问控制（RBAC）
3. **消息通知**：作业票状态变更时发送通知
4. **文件上传**：支持上传作业票扫描件、安全交底记录等
5. **报表统计**：作业票统计分析、安全趋势分析
6. **移动端**：开发移动端应用，支持现场扫码操作
