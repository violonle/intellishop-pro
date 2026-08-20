import React, { useState } from 'react';
import { Button, Input, Select, Switch, message } from 'antd';
import { User, Mail, Phone, Building2, Bot, Save, ShieldCheck } from 'lucide-react';
import { getUser, setUser } from '@/utils/storage';
import { updateUserInfo } from '@/services/user';

export const ProfileEditPage: React.FC = () => {
    const user = getUser();
    const [name, setName] = useState(user?.realName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [saving, setSaving] = useState(false);
    const roleLabel = ({
        enterprise_admin: '店长/经理',
        sales_director: '销售负责人',
        sales_manager: '销售经理',
        sales: '销售专员',
        user: '普通用户'
    } as Record<string, string>)[user?.role] || user?.role || '未设置岗位';

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        try {
            const updated = await updateUserInfo(user.id, { realName: name, phone, email });
            setUser({ ...user, ...updated });
            message.success('个人基本信息已更新');
        } catch (error: any) {
            message.error(error.message || '个人信息更新失败');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    个人资料与 AI 助理偏好
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    维护您的个人信息、工作习惯与专属 AI 智能体协助模式
                </p>
            </div>

            {/* 个人基本信息卡片 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-sm">
                        {name[0] || '未'}
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{name}</h3>
                        <div className="text-slate-400 text-xs mt-0.5">{roleLabel}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">真实姓名</label>
                        <Input value={name} onChange={e => setName(e.target.value)} className="!rounded-xl text-xs" />
                    </div>
                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">业务岗位角色</label>
                        <Input value={roleLabel} disabled className="!rounded-xl text-xs" />
                    </div>
                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">手机号码</label>
                        <Input value={phone} onChange={e => setPhone(e.target.value)} className="!rounded-xl text-xs" />
                    </div>
                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">工作邮箱</label>
                        <Input value={email} onChange={e => setEmail(e.target.value)} className="!rounded-xl text-xs" />
                    </div>
                </div>
            </div>

            {/* AI 专属偏好设置卡片 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    专属 AI 智能体协作偏好
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">话术生成语气风格</label>
                        <Select
                            value="professional"
                            disabled
                            className="w-full !rounded-xl"
                            options={[
                                { value: 'professional', label: '专业稳重型 (适合 B2B 大客户与高管沟通)' },
                                { value: 'friendly', label: '亲切热情型 (适合社群营销与快速首触)' },
                                { value: 'concise', label: '极致精炼型 (突出 ROI 数据与技术干货)' },
                            ]}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                        <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">SDR 自动首触话术生成</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">当新分配线索进入时，AI 自动在后台生成专属首触脚本并推送至待办</div>
                        </div>
                        <Switch checked={false} disabled />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                        <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">通话/会议实时耳语提示</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">检测到客户关键异议时，在屏幕右下角静默弹出攻坚应对建议</div>
                        </div>
                        <Switch checked={false} disabled />
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <Button
                        type="primary"
                        icon={<Save className="w-3.5 h-3.5" />}
                        onClick={handleSave}
                        loading={saving}
                        className="!rounded-xl !bg-blue-600 !font-bold !text-xs !h-9 !px-6"
                    >
                        保存设置
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditPage;
