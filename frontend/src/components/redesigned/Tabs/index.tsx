import React from 'react';

interface Tab {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);

    return (
        <div style={{ width: '100%' }}>
            <div style={{
                display: 'flex',
                borderBottom: '2px solid #e1e5e9',
                marginBottom: '16px'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        style={{
                            padding: '12px 20px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            borderBottom: activeTab === tab.id ? '2px solid #007bff' : '2px solid transparent',
                            color: activeTab === tab.id ? '#007bff' : '#666',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: activeTab === tab.id ? '600' : '400',
                            marginBottom: '-2px'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTabData && (
                <div style={{ padding: '16px 0' }}>
                    {activeTabData.content}
                </div>
            )}
        </div>
    );
};

export default Tabs;