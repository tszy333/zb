# zb - 值班日历

一个简洁的值班排班日历 Web 应用。

## 功能

- 📅 双月日历显示，每天显示值班班级和人员
- 🖱️ 点击日期弹窗查看完整值班人员名单
- 🎉 自动显示中国法定节假日和补班日
- ⚙️ 自由配置班级数量、名称和人员
- 📊 Excel 导入导出，方便批量管理
- 🐳 Docker 一键部署

## 快速开始

### Docker 运行（推荐）

```bash
docker build -t zb .
docker run -d -p 5000:5000 -v $(pwd)/data:/data zb
```

然后浏览器打开 http://localhost:5000

### 本地运行

```bash
pip install -r requirements.txt
python app.py
```

## 配置

### 方式一：界面配置

- 点击右上角 **设置** 修改管理员和起始日期
- 点击 **管理班级** 添加/编辑/删除班级

### 方式二：Excel 导入

1. 点击 **导出Excel** 下载当前配置模板
2. 修改 Excel 文件
3. 点击 **导入Excel** 上传

### 方式三：直接编辑配置文件

配置文件位于挂载目录 `data/config.json`：

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
    }
  ]
}
```

## Excel 模板格式

| 班级名称 | 显示人员 | 值班人员 |
|----------|----------|----------|
| 甲班 | 张三、李四 | 张三、李四、王五、赵六 |
| 乙班 | 钱七、孙八 | 钱七、孙八、周九、吴十 |

## 排班规则

- 每天 1 个班值班（含周末和节假日）
- 从起始日期开始，按班级顺序轮转
- 法定节假日自动标注
- 补班日（调休上班）自动标注

## 技术栈

- **后端**: Python Flask
- **前端**: Bootstrap 5 + Bootstrap Icons
- **节假日**: chinese-calendar 库（自动获取）
- **Excel**: openpyxl

## License

MIT
