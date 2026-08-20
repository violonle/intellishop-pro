import React, { useState } from 'react';
import systemService from '../../services/systemService';

const PermissionsTest: React.FC = () => {
    const [results, setResults] = useState<Record<string, any>>({});
    const [userIdInput, setUserIdInput] = useState('');

    const handleAction = async (action: string) => {
        let data: any = { error: 'Unknown action' };

        try {
            switch (action) {
                case 'enabled':
                    data = await systemService.getAllPermissions();
                    break;
                case 'resources':
                    data = await systemService.getAllResources();
                    break;
                case 'countEnabled':
                    data = await systemService.countEnabledPermissions();
                    break;
                case 'byUser':
                    if (!userIdInput) {
                        data = { error: 'Please enter User ID' };
                    } else {
                        data = await systemService.getUserPermissions(userIdInput);
                    }
                    break;
                default:
                    data = { message: 'Action not implemented' };
            }
        } catch (error: any) {
            data = { error: error.message || 'API Call Failed' };
        }

        setResults(prev => ({ ...prev, [action]: data }));
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-mono text-sm overflow-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">Permissions 接口联调测试</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { id: 'enabled', title: 'GET /permissions/enabled', btn: 'Fetch Enabled' },
                    { id: 'resources', title: 'GET /permissions/resources', btn: 'Fetch Resources' },
                    { id: 'countEnabled', title: 'GET /permissions/count/enabled', btn: 'Count' },
                    { id: 'byUser', title: 'GET /permissions/user/{id}', btn: 'Fetch User Perms', hasInput: true },
                ].map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded shadow border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-2">{item.title}</h3>
                        <div className="flex gap-2 mb-3">
                            {item.hasInput && (
                                <input
                                    type="text"
                                    placeholder="User ID"
                                    className="border p-1 rounded text-xs flex-1"
                                    value={userIdInput}
                                    onChange={e => setUserIdInput(e.target.value)}
                                />
                            )}
                            <button onClick={() => handleAction(item.id)} className="bg-gray-100 hover:bg-gray-200 border px-3 py-1 rounded text-xs">
                                {item.btn}
                            </button>
                        </div>
                        <div className="bg-gray-900 text-green-400 p-3 rounded h-32 overflow-auto text-xs whitespace-pre">
                            {results[item.id] ? JSON.stringify(results[item.id], null, 2) : '// No data'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PermissionsTest;
