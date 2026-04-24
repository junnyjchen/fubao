'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Key,
  AlertTriangle,
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  is_system: boolean;
  permissions: string[];
  status: boolean;
}

interface Permission {
  id: number;
  name: string;
  code: string;
  group_name: string;
  description: string;
}

interface PermissionGroup {
  key: string;
  name: string;
  icon: string;
}

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    permissions: [] as string[],
    status: true,
  });

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/admin/roles'),
        fetch('/api/admin/permissions'),
      ]);

      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();

      if (rolesData.data) setRoles(rolesData.data);
      if (permsData.data) {
        setPermissions(permsData.data.permissions || []);
        setGroups(permsData.data.groups || []);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加載數據失敗');
    } finally {
      setLoading(false);
    }
  };

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      permissions: [],
      status: true,
    });
    setModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description || '',
      permissions: role.permissions || [],
      status: role.status,
    });
    setModalOpen(true);
  };

  // 打开删除确认
  const handleDeleteClick = (role: Role) => {
    setDeletingRole(role);
    setDeleteModalOpen(true);
  };

  // 保存角色
  const handleSave = async () => {
    if (!formData.name) {
      toast.error('請輸入角色名稱');
      return;
    }
    if (!formData.code) {
      toast.error('請輸入角色代碼');
      return;
    }

    setSaving(true);
    try {
      const url = editingRole ? `/api/admin/roles?id=${editingRole.id}` : '/api/admin/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingRole?.id,
          ...formData,
        }),
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

  // 删除角色
  const handleDelete = async () => {
    if (!deletingRole) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/roles?id=${deletingRole.id}`, {
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

  // 切换权限
  const togglePermission = (code: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(code)
        ? prev.permissions.filter(p => p !== code)
        : [...prev.permissions, code],
    }));
  };

  // 按分组显示权限
  const permissionsByGroup = groups.map(group => ({
    ...group,
    items: permissions.filter(p => p.group_name === group.key),
  }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            角色管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理系统角色和权限配置
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          新增角色
        </Button>
      </div>

      {/* 角色列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            角色列表
          </CardTitle>
          <CardDescription>
            共有 {roles.length} 個角色
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名稱</TableHead>
                <TableHead>角色代碼</TableHead>
                <TableHead>權限數量</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>系統角色</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map(role => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {role.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    {role.permissions?.length === 1 && role.permissions[0] === '*'
                      ? '全部權限'
                      : `${role.permissions?.length || 0} 個權限`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.status ? 'default' : 'secondary'}>
                      {role.status ? '啟用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {role.is_system && (
                      <Badge variant="outline" className="text-orange-500">
                        系統
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!role.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(role)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? '編輯角色' : '新增角色'}
            </DialogTitle>
            <DialogDescription>
              {editingRole?.is_system
                ? '系統角色只能修改描述和狀態'
                : '請填寫角色資訊'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 基本資訊 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">角色名稱 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="輸入角色名稱"
                  disabled={editingRole?.is_system}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">角色代碼 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="如: editor"
                  disabled={editingRole?.is_system}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">角色描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="輸入角色描述"
              />
            </div>

            {/* 權限配置 */}
            {!editingRole?.is_system && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <Label>權限配置</Label>
                </div>

                <Tabs defaultValue={groups[0]?.key}>
                  <TabsList className="flex flex-wrap h-auto">
                    {groups.map(group => (
                      <TabsTrigger key={group.key} value={group.key}>
                        {group.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {permissionsByGroup.map(group => (
                    <TabsContent key={group.key} value={group.key} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {group.items.map(perm => (
                          <div
                            key={perm.code}
                            className="flex items-start gap-3 p-3 rounded-lg border"
                          >
                            <Checkbox
                              id={perm.code}
                              checked={formData.permissions.includes(perm.code)}
                              onCheckedChange={() => togglePermission(perm.code)}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={perm.code}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {perm.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {perm.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}

            {/* 狀態 */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="status"
                checked={formData.status}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, status: !!checked }))}
              />
              <Label htmlFor="status">啟用角色</Label>
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
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              確認刪除
            </DialogTitle>
            <DialogDescription>
              確定要刪除角色「{deletingRole?.name}」嗎？此操作無法撤銷。
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
