import React, { useEffect, useState } from 'react';
import { Button, Tag, Input, Upload, message } from 'antd';
import { Building2, ShieldCheck, CheckCircle2, UploadCloud, Save } from 'lucide-react';
import { getCurrentEnterprise, submitCertification } from '@/services/enterprise';

export const EnterpriseCertificationPage: React.FC = () => {
    const [enterpriseId, setEnterpriseId] = useState<number>();
    const [companyName, setCompanyName] = useState('');
    const [creditCode, setCreditCode] = useState('');
    const [legalPerson, setLegalPerson] = useState('');
    const [status, setStatus] = useState<number | undefined>();

    useEffect(() => {
        getCurrentEnterprise().then((enterprise: any) => {
            setEnterpriseId(enterprise?.id);
            setCompanyName(enterprise?.name || '');
            setCreditCode(enterprise?.socialCode || '');
            setLegalPerson(enterprise?.legalName || '');
            setStatus(enterprise?.status);
        }).catch(() => message.error('企业信息加载失败'));
    }, []);

    const handleSave = async () => {
        try {
            await submitCertification({ id: enterpriseId, name: companyName, socialCode: creditCode, legalName: legalPerson });
            message.success('企业资质信息已提交审核');
        } catch {
            message.error('提交失败，请检查权限和网络');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    企业资质认证与工作空间设置
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    完成企业实名认证以解锁大模型私有化接口与企微高级 API 权限
                </p>
            </div>

            {/* 认证状态卡片 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">企业实名认证</h3>
                                <Tag color={status === 1 ? 'success' : 'default'} className="!rounded-md !m-0 !text-[10px] !font-bold">{status === 1 ? '已通过认证' : '待审核'}</Tag>
                            </div>
                            <div className="text-slate-400 text-xs mt-0.5">认证有效期至: 2027-12-31 · 尊享旗舰级安全与 SLA 支持</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">企业全称</label>
                        <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="!rounded-xl text-xs" />
                    </div>
                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">统一社会信用代码</label>
                        <Input value={creditCode} onChange={e => setCreditCode(e.target.value)} className="!rounded-xl text-xs font-mono" />
                    </div>
                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">法定代表人姓名</label>
                        <Input value={legalPerson} onChange={e => setLegalPerson(e.target.value)} className="!rounded-xl text-xs" />
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <Button
                        type="primary"
                        icon={<Save className="w-3.5 h-3.5" />}
                            onClick={handleSave}
                        className="!rounded-xl !bg-blue-600 !font-bold !text-xs !h-9 !px-6"
                    >
                        保存并更新
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EnterpriseCertificationPage;
