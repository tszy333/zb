/* ── 值班日历 JS ────────────────────────────── */

// 弹窗实例缓存
let dutyModal, settingsModal, classModal, editClassModal;

document.addEventListener('DOMContentLoaded', () => {
    dutyModal = new bootstrap.Modal(document.getElementById('dutyModal'));
    settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
    classModal = new bootstrap.Modal(document.getElementById('classModal'));
    editClassModal = new bootstrap.Modal(document.getElementById('editClassModal'));
});

// ── 点击日期弹窗 ──────────────────────────────
function showDuty(dateStr, dayNum, className, display, members, holidayName, isMakeup) {
    document.getElementById('dutyModalTitle').textContent = dayNum + ' 值班详情';

    let html = '<div class="duty-detail-card">';
    html += '<div class="date-title">' + dateStr + '</div>';
    html += '<div class="class-title">' + (className || '未排班') + '</div>';
    if (holidayName && holidayName !== 'None') {
        html += '<div class="holiday-badge">🎉 ' + holidayName + '</div>';
    }
    if (isMakeup === 'True') {
        html += '<div class="holiday-badge">📋 补班日</div>';
    }
    html += '</div>';

    if (members) {
        html += '<h6 class="text-center text-muted mb-3">值班人员</h6>';
        html += '<div class="members-list">';
        members.split('、').forEach(m => {
            if (m.trim()) {
                html += '<span class="member-chip">' + m.trim() + '</span>';
            }
        });
        html += '</div>';
    } else {
        html += '<p class="text-center text-muted">暂无值班人员</p>';
    }

    document.getElementById('dutyModalBody').innerHTML = html;
    dutyModal.show();
}

// ── 设置 ──────────────────────────────────────
function openSettings() {
    fetch('/api/config')
        .then(r => r.json())
        .then(cfg => {
            document.getElementById('setAdmin').value = cfg.admin;
            document.getElementById('setStartDate').value = cfg.start_date;
            settingsModal.show();
        });
}

function saveSettings() {
    const data = {
        admin: document.getElementById('setAdmin').value,
        start_date: document.getElementById('setStartDate').value,
    };
    fetch('/api/settings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    }).then(() => location.reload());
}

// ── 管理班级 ──────────────────────────────────
function openClassManager() {
    fetch('/api/config')
        .then(r => r.json())
        .then(cfg => {
            renderClassTable(cfg.classes);
            classModal.show();
        });
}

function renderClassTable(classes) {
    let html = '<table class="table table-sm class-table">';
    html += '<thead><tr><th>#</th><th>班级名称</th><th>显示人员</th><th>值班人员</th><th>操作</th></tr></thead><tbody>';
    classes.forEach((cls, i) => {
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td><input class="form-control form-control-sm" value="' + esc(cls.name) + '" data-field="name"></td>';
        html += '<td><input class="form-control form-control-sm" value="' + esc(cls.display) + '" data-field="display"></td>';
        html += '<td><input class="form-control form-control-sm" value="' + esc(cls.members.join('、')) + '" data-field="members"></td>';
        html += '<td><button class="btn-delete" onclick="this.closest(\'tr\').remove()"><i class="bi bi-trash3"></i></button></td>';
        html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('classModalBody').innerHTML = html;
}

function addClassRow() {
    const tbody = document.querySelector('.class-table tbody');
    const i = tbody.rows.length + 1;
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + i + '</td>'
        + '<td><input class="form-control form-control-sm" value="" data-field="name" placeholder="如：丁班"></td>'
        + '<td><input class="form-control form-control-sm" value="" data-field="display" placeholder="如：甲一、甲二"></td>'
        + '<td><input class="form-control form-control-sm" value="" data-field="members" placeholder="用顿号分隔"></td>'
        + '<td><button class="btn-delete" onclick="this.closest(\'tr\').remove()"><i class="bi bi-trash3"></i></button></td>';
    tbody.appendChild(tr);
}

function saveClasses() {
    const rows = document.querySelectorAll('.class-table tbody tr');
    const classes = [];
    rows.forEach(row => {
        const name = row.querySelector('[data-field="name"]').value.trim();
        const display = row.querySelector('[data-field="display"]').value.trim();
        const membersStr = row.querySelector('[data-field="members"]').value.trim();
        const members = membersStr.split('、').map(m => m.trim()).filter(Boolean);
        if (name) {
            classes.push({ name, display, members });
        }
    });
    fetch('/api/config', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ classes }),
    }).then(() => location.reload());
}

// ── Excel 导入 ────────────────────────────────
function importExcel(input) {
    const file = input.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    fetch('/import/excel', {
        method: 'POST',
        body: formData,
    })
    .then(r => r.json())
    .then(data => {
        if (data.ok) {
            alert('导入成功！共导入 ' + data.count + ' 个班级');
            location.reload();
        } else {
            alert('导入失败：' + data.error);
        }
    })
    .catch(err => alert('导入失败：' + err));
    input.value = '';
}

// ── 月份切换（前端重新请求） ──────────────────
function changeMonth(direction, yearMonth) {
    // 简单实现：重新加载页面（后续可改为 AJAX）
    const [y, m] = yearMonth.split('-').map(Number);
    let newM = m + direction;
    let newY = y;
    if (newM < 1) { newM = 12; newY--; }
    if (newM > 12) { newM = 1; newY++; }
    // 通过 URL 参数切换（暂不实现，保持显示当前月+下月）
    // TODO: 可扩展为自由切换月份
}

// ── 工具 ──────────────────────────────────────
function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── 单个班级编辑（从管理班级弹窗跳转） ─────────
let editingClasses = [];

function openEditClass(idx) {
    fetch('/api/config')
        .then(r => r.json())
        .then(cfg => {
            editingClasses = cfg.classes;
            const cls = cfg.classes[idx];
            if (!cls) return;
            document.getElementById('editClassIdx').value = idx;
            document.getElementById('editClassName').value = cls.name;
            document.getElementById('editClassDisplay').value = cls.display;
            document.getElementById('editClassMembers').value = cls.members.join('、');
            document.getElementById('editClassTitle').textContent = '编辑 ' + cls.name;
            editClassModal.show();
        });
}

function saveSingleClass() {
    const idx = parseInt(document.getElementById('editClassIdx').value);
    const data = {
        name: document.getElementById('editClassName').value,
        display: document.getElementById('editClassDisplay').value,
        members: document.getElementById('editClassMembers').value.split('、').map(m => m.trim()).filter(Boolean),
    };
    fetch('/api/class/' + idx, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    }).then(() => location.reload());
}

function deleteClass() {
    const idx = parseInt(document.getElementById('editClassIdx').value);
    if (!confirm('确定删除此班？')) return;
    fetch('/api/class/' + idx, {
        method: 'DELETE',
    }).then(() => location.reload());
}
