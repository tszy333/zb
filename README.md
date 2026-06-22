# zb - 值班日历

一个简洁美观的值班排班日历 Web 应用。支持自定义班级、自动法定节假日标注、Excel 导入导出，Docker 一键部署。

---

## ✨ 功能特性

- 📅 **双月日历** — 同时显示当前月和下月的值班安排
- 👥 **自定义班级** — 自由设置班级数量、名称和人员
- 🖱️ **点击查看详情** — 点击任意日期弹窗显示该班全部值班人员
- 🎉 **法定节假日** — 自动标注中国法定节假日（春节、国庆、端午等），显示节日名称
- 📋 **补班日标注** — 自动识别调休补班日并标注
- 📊 **Excel 导入导出** — 批量管理班级人员，下载模板 → 填写 → 导入
- ⚙️ **灵活配置** — 管理员、排班起始日期均可在界面修改
- 🐳 **Docker 部署** — 一条命令启动，浏览器访问即用

---

## 🚀 快速开始

### 方式一：Docker Compose（推荐）

```bash
git clone https://github.com/tszy333/zb.git
cd zb
docker compose up -d
```

浏览器打开 http://localhost:5000

### 方式二：Docker 直接运行

```bash
docker build -t zb .
docker run -d --name zb -p 5000:5000 -v $(pwd)/data:/data zb
```

### 方式三：本地运行

```bash
pip install -r requirements.txt
python app.py
```

---

## 📖 使用说明

### 首次使用

首次打开页面会显示**示例数据**和引导提示：

1. 点击右上角 **「管理班级」** 添加你的班级和人员
2. 或点击 **「导出Excel」** 下载模板，填写后 **「导入Excel」**
3. 点击 **「设置」** 修改管理员名称和排班起始日期

### 管理班级

| 操作 | 说明 |
|------|------|
| 添加班级 | 点击弹窗底部「添加班级」按钮 |
| 编辑班级 | 直接在表格中修改名称、显示人员、值班人员 |
| 删除班级 | 点击行末的删除图标 |

### Excel 导入导出

**Excel 模板格式：**

| 班级名称 | 显示人员 | 值班人员 |
|----------|----------|----------|
| 甲班 | 张三、李四 | 张三、李四、王五、赵六 |
| 乙班 | 钱七、孙八 | 钱七、孙八、周九、吴十 |

- **显示人员**：日历格子上直接显示的名字（一般 1-2 人）
- **值班人员**：点击日期后弹窗显示的完整名单
- 人员之间用中文顿号 `、` 分隔

### 设置项

| 设置 | 说明 |
|------|------|
| 管理员 | 显示在页面顶部 |
| 排班起始日期 | 从该日期开始按班级顺序轮转排班 |

---

## 📅 排班规则

- **每天 1 个班值班**，包括周末和法定节假日
- 从「起始日期」开始，按班级列表顺序轮转
- 示例（3个班，起始日期 7月1日）：

```
7月1日 → 甲班
7月2日 → 乙班
7月3日 → 丙班
7月4日 → 甲班（重新轮转）
...
```

### 节假日说明

- 法定节假日自动标注红色，显示节日名称（如「端午」「国庆」）
- 调休补班日标注橙色「补班」标签
- 节假日数据由 `chinese-calendar` 库自动获取，无需手动维护

---

## 🐳 Docker 部署详解

### docker-compose.yml

```yaml
version: "3.8"

services:
  zb:
    build: .
    container_name: zb
    ports:
      - "5000:5000"
    volumes:
      - ./data:/data
    environment:
      - CONFIG_PATH=/data/config.json
      - PORT=5000
    restart: unless-stopped
```

### 目录结构

```
zb/
├── app.py                 # Flask 后端
├── config.json            # 默认配置（首次启动自动复制到 data/）
├── requirements.txt       # Python 依赖
├── Dockerfile             # Docker 构建文件
├── docker-compose.yml     # Docker Compose 编排
├── README.md              # 本文件
├── templates/
│   ├── index.html         # 主页面
│   └── calendar.html      # 日历组件
└── static/
    ├── css/style.css      # 样式
    └── js/app.js          # 前端交互
```

### 数据持久化

配置文件存储在 `./data/config.json`，通过 Docker volume 挂载。容器重建后数据不会丢失。

### 自定义端口

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:5000"  # 通过 8080 端口访问
```

---

## ⚙️ 配置文件说明

配置文件 `data/config.json` 结构如下：

```json
{
  "year": 2026,
  "month": 7,
  "start_date": "2026-07-01",
  "admin": "管理员",
  "classes": [
    {
      "name": "甲班",
      "display": "张三、李四",
      "members": ["张三", "李四", "王五", "赵六"]
    },
    {
      "name": "乙班",
      "display": "钱七、孙八",
      "members": ["钱七", "孙八", "周九", "吴十"]
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| `year` | 年份（用于显示） |
| `month` | 月份（用于显示） |
| `start_date` | 排班起始日期，格式 `YYYY-MM-DD` |
| `admin` | 管理员名称 |
| `classes` | 班级列表 |
| `classes[].name` | 班级名称 |
| `classes[].display` | 日历上显示的人员（简短） |
| `classes[].members` | 该班全部值班人员（数组） |

---

## 🛠️ 技术栈

| 组件 | 技术 |
|------|------|
| 后端 | Python 3 + Flask |
| 前端 | Bootstrap 5 + Bootstrap Icons |
| 节假日 | chinese-calendar（自动获取中国法定节假日） |
| Excel | openpyxl（读写 .xlsx） |
| 部署 | Docker / Docker Compose |

---

## 📝 更新日志

### v1.0.0 (2026-06-22)
- 初始版本
- 双月日历显示
- 自定义班级管理
- 法定节假日自动标注
- 补班日标注
- Excel 导入导出
- Docker 部署支持

---

## 📄 License

MIT
