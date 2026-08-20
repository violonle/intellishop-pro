import React, { useState, useEffect } from 'react';
import { Card, Typography, Switch, Button, Divider, Tag, Modal, Form, Input, message, Spin } from 'antd';
import { MailOutlined, MessageOutlined, BellOutlined } from '@ant-design/icons';
import { getSettingsByType, saveSetting } from '@/services/setting';

const { Title, Text } = Typography;

const Notifications: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCode, setCurrentCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [form] = Form.useForm();

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await getSettingsByType('NOTIFICATION');
            const data = res as any;
            if (data) {
                setSettings(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const openConfig = (code: string) => {
        setCurrentCode(code);
        // Try to parse values from settings for this code
        // For simplicity, we assume settingKey is code_CONFIG
        const configJson = settings[`${code}_CONFIG`];
        if (configJson) {
            try {
                form.setFieldsValue(JSON.parse(configJson));
            } catch (e) {
                form.resetFields();
            }
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const values = await form.validateFields();
            await saveSetting({
                settingKey: `${currentCode}_CONFIG`,
                settingValue: JSON.stringify(values),
                type: 'NOTIFICATION',
                description: `${currentCode} configuration`
            });
            message.success('配置已保存');
            setIsModalOpen(false);
            fetchConfig();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (code: string, checked: boolean) => {
        try {
            await saveSetting({
                settingKey: `${code}_ENABLED`,
                settingValue: checked ? 'true' : 'false',
                type: 'NOTIFICATION',
                description: `${code} enabled status`
            });
            message.success(`${code} 已${checked ? '开启' : '关闭'}`);
            fetchConfig();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <Spin spinning={loading}>
                <Title level={3}>消息服务配置</Title>
                <Text type="secondary">配置系统发送短信、邮件及站内信的通道与模板</Text>

                <Divider />

                <Card className="mb-4 shadow-sm border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl">
                                <MessageOutlined />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg m-0">短信服务 (SMS)</h4>
                                <p className="text-gray-500 m-0">用于发送验证码、业务通知</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Tag color={settings['SMS_ENABLED'] === 'true' ? 'success' : 'default'}>
                                {settings['SMS_ENABLED'] === 'true' ? 'Running' : 'Stopped'}
                            </Tag>
                            <Switch
                                checked={settings['SMS_ENABLED'] === 'true'}
                                onChange={(checked) => handleToggle('SMS', checked)}
                            />
                            <Button onClick={() => openConfig('SMS')}>配置网关</Button>
                        </div>
                    </div>
                </Card>

                <Card className="mb-4 shadow-sm border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl">
                                <MailOutlined />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg m-0">邮件服务 (Email)</h4>
                                <p className="text-gray-500 m-0">用于发送报表、营销邮件</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Tag color={settings['EMAIL_ENABLED'] === 'true' ? 'success' : 'default'}>
                                {settings['EMAIL_ENABLED'] === 'true' ? 'Running' : 'Stopped'}
                            </Tag>
                            <Switch
                                checked={settings['EMAIL_ENABLED'] === 'true'}
                                onChange={(checked) => handleToggle('EMAIL', checked)}
                            />
                            <Button onClick={() => openConfig('EMAIL')}>SMTP设置</Button>
                        </div>
                    </div>
                </Card>

                <Card className="mb-4 shadow-sm border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xl">
                                <BellOutlined />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg m-0">站内信 (Inbox)</h4>
                                <p className="text-gray-500 m-0">系统内部消息推送</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Tag color="processing">Active</Tag>
                            <Switch checked={true} disabled />
                            <Button onClick={() => message.info('站内信模板为系统内置')}>模板管理</Button>
                        </div>
                    </div>
                </Card>
            </Spin>

            <Modal
                title={`${currentCode} 配置`}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={saving}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="endpoint" label="API Endpoint"><Input placeholder="https://api.gateway.com" /></Form.Item>
                    <Form.Item name="accessKey" label="Access Key"><Input /></Form.Item>
                    <Form.Item name="secretKey" label="Secret Key"><Input.Password /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Notifications;
