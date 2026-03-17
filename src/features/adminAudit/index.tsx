import { useEffect, useState } from 'react';
import { useFetch } from 'react-hooks-ts';
import { Row, Table } from 'antd';

export default function AuditAdminPage() {
  const [filters, setFilters] = useState({
    date: '',
    actionType: '',
    user: ''
  });
  const { data, refetch } = useFetch('/api/audit', {
    config: {
      query: filters
    },
    enabled: false,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    refetch();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Logs de Auditoria</h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.date}
          onChange={(e) => handleFilterChange('date', e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Ação"
          value={filters.actionType}
          onChange={(e) => handleFilterChange('actionType', e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Usuário"
          value={filters.user}
          onChange={(e) => handleFilterChange('user', e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => refetch()}
        >
          Filtrar
        </button>
      </div>

      {/* Tabela */}
      <Table
        offScreenText="Nenhum registro encontrado"
        dataSource={data || []}
        rowKey="id"
      >
        <Table.Title>
          <Row>
            <Table.Column title="Data" dataIndex="date" key="date" />
            <Table.Column title="Ação" dataIndex="actionType" key="actionType" />
            <Table.Column title="Usuário" dataIndex="user" key="user" />
            <Table.Column title="Detalhes" dataIndex="metadata" key="metadata" />
          </Row>
        </Table.Title>
      </Table>
    </div>
  );
}
