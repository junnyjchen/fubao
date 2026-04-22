'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  UserPlus,
  Edit,
  Trash2,
  Users,
  Search,
  Shield,
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  code: string;
}

interface Admin {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role_id: number;
  role?: {
    name: string;
    code: string;
  };
  status: boolean;
  last_login_at: string;
  login_count: number;
  created_at: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
  const [saving, setSaving] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role_id: 0,
    status: true,
  });

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, rolesRes] = await Promise.all([
        fetch('/api/admin/admins'),
        fetch('/api/admin/roles'),
      ]);

      const adminsData = await adminsRes.json();
      const rolesData = await rolesRes.json();

      if (adminsData.data) setAdmins(adminsData.data);
      if (rolesData.data) setRoles(rolesData.data);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加載數據失敗');
    } finally {
      setLoading(false);
    }
  };

  // 过滤
  const filteredAdmins = admins.filter(admin =>
    admin.username.includes(search) ||
    admin.name.includes(search) ||
    admin.email?.includes(search)
  );

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingAdmin(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      role_id: roles[0]?.id || 1,
      status: true,
    });
    setModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: '',
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.phone || '',
      role_id: admin.role_id,
      status: admin.status,
    });
    setModalOpen(true);
  };

  // 打开删除确认
  const handleDeleteClick = (admin: Admin) => {
    setDeletingAdmin(admin);
    setDeleteModalOpen(true);
  };

  // 保存管理员
  const handleSave = async () => {
    if (!formData.username) {
      toast.error('請輸入用戶名');
      return;
    }
    if (!editingAdmin && !formData.password) {
      toast.error('請輸入密碼');
      return;
    }
    if (!formData.role_id) {
      toast.error('請選擇角色');
      return;
    }

    setSaving(true);
    try {
      const url = editingAdmin ? `/api/admin/admins?id=${editingAdmin.id}` : '/api/admin/admins';
      const method = editingAdmin ? 'PUT' : 'POST';

      const body: any = { ...formData };
      if (!body.password) delete body.password;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success || data.message) {
        toast.success(data.message || '保存成功');
        setModalOpen(false);
        loadData();
      } else {
        toast.error(data.error || '保存失敗');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失敗');
    } finally {
      setSaving(false);
    }
  };

  // 删除管理员
  const handleDelete = async () => {
    if (!deletingAdmin) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/admins?id=${deletingAdmin.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success || data.message) {
        toast.success(data.message || '刪除成功');
        setDeleteModalOpen(false);
        loadData();
      } else {
        toast.error(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('刪除失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            管理员管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理管理员账户和权限
          </p>
        </div>
        <Button onClick={handleAdd}>
          <UserPlus className="h-4 w-4 mr-2" />
          新增管理员
        </Button>
      </div>

      {/* 搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户名、姓名或邮箱..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 管理员列表 */}
      <Card>
        <CardHeader>
          <CardTitle>管理员列表</CardTitle>
          <CardDescription>
            共有 {filteredAdmins.length} 個管理員
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用戶名</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>郵箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>登錄次數</TableHead>
                <TableHead>最後登錄</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map(admin => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.username}</TableCell>
                  <TableCell>{admin.name || '-'}</TableCell>
                  <TableCell>{admin.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {admin.role?.name || '未分配'}
                    </Badge>
                  </TableCell>
                  <TableCell>{admin.login_count || 0}</TableCell>
                  <TableCell>
                    {admin.last_login_at
                      ? new Date(admin.last_login_at).toLocaleDateString('zh-TW')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.status ? 'default' : 'secondary'}>
                      {admin.status ? '啟用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(admin)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(admin)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAdmins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    暫無數據
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? '編輯管理員' : '新增管理員'}
            </DialogTitle>
            <DialogDescription>
              {editingAdmin ? '編輯管理員資訊' : '創建新的管理員帳戶'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用戶名 *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="輸入用戶名"
                  disabled={!!editingAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  密碼 {editingAdmin && '(不修改請留空)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={editingAdmin ? '留空則不修改' : '輸入密碼'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="輸入姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">角色 *</Label>
                <Select
                  value={String(formData.role_id)}
                  onValueChange={value => setFormData(prev => ({ ...prev, role_id: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">郵箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="輸入郵箱"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="輸入電話"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="status"
                checked={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="status">啟用帳戶</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 刪除確認 */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              確定要刪除管理員「{deletingAdmin?.username}」嗎？此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? '刪除中...' : '確認刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
