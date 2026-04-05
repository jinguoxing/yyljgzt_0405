// Mock data and API service for Semantic Governance

export interface Task {
  taskId: string;
  lvId: string;
  lvName: string;
  phase: 'field' | 'object' | 'mapping' | 'publish';
  severity: 'MUST' | 'REVIEW' | 'INFO';
  status: 'OPEN' | 'DONE' | 'IGNORED';
  taskType: 'CONFLICT' | 'ANOMALY' | 'DRIFT' | 'HIGH_IMPACT';
  scope: {
    type: 'FIELD' | 'OBJECT' | 'MAPPING';
    id: string;
    name: string;
  };
  title: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: {
    downstreams: number;
    objects: number;
    sensitiveFields: number;
  };
  updatedAt: string;
}

export interface Release {
  releaseId: string;
  lvId: string;
  lvName: string;
  snapshotVersion: string;
  status: 'PREVIEWED' | 'PUBLISHED' | 'ROLLED_BACK';
  gateSnapshot: {
    must: number;
    coverage: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  createdAt: string;
  createdBy: string;
}

// Mock Data Store
const tasks: Task[] = [
  {
    taskId: 'task_001',
    lvId: 'lv_005',
    lvName: 't_hr_employee',
    phase: 'field',
    severity: 'MUST',
    status: 'OPEN',
    taskType: 'CONFLICT',
    scope: { type: 'FIELD', id: 'f_001', name: 'employee_id' },
    title: '字段语义冲突: IDENTIFIER vs TEXT',
    riskLevel: 'HIGH',
    impact: { downstreams: 16, objects: 1, sensitiveFields: 0 },
    updatedAt: new Date().toISOString(),
  },
  {
    taskId: 'task_002',
    lvId: 'lv_006',
    lvName: 't_sales_order',
    phase: 'mapping',
    severity: 'REVIEW',
    status: 'OPEN',
    taskType: 'ANOMALY',
    scope: { type: 'MAPPING', id: 'm_002', name: 'amount -> total_amt' },
    title: '检测到映射逻辑漂移',
    riskLevel: 'MEDIUM',
    impact: { downstreams: 5, objects: 2, sensitiveFields: 1 },
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    taskId: 'task_003',
    lvId: 'lv_007',
    lvName: 't_cust_profile',
    phase: 'object',
    severity: 'INFO',
    status: 'OPEN',
    taskType: 'DRIFT',
    scope: { type: 'OBJECT', id: 'o_003', name: 'customer_profile' },
    title: '检测到新的上游字段',
    riskLevel: 'LOW',
    impact: { downstreams: 2, objects: 1, sensitiveFields: 0 },
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const releases: Release[] = [
  {
    releaseId: 'pv_001',
    lvId: 'lv_005',
    lvName: 't_hr_employee',
    snapshotVersion: 'semver_20260224_001',
    status: 'PREVIEWED',
    gateSnapshot: { must: 0, coverage: 0.84, riskLevel: 'MEDIUM' },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'user_01',
  },
  {
    releaseId: 'pub_002',
    lvId: 'lv_004',
    lvName: 't_dim_date',
    snapshotVersion: 'v1.0.2',
    status: 'PUBLISHED',
    gateSnapshot: { must: 0, coverage: 1.0, riskLevel: 'LOW' },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    createdBy: 'system',
  },
];

export const SemanticApi = {
  getInboxSummary: async () => {
    return {
      open: { must: 7, conflict: 3, anomaly: 2, drift: 5 },
      readyForPreview: 4,
      coverageGapCount: 6,
      highImpactCount: 5,
      asOf: new Date().toISOString(),
    };
  },

  getInboxTasks: async (filters: any) => {
    // Simulate filtering
    let filtered = [...tasks];
    if (filters?.quickFilter === 'MUST') {
      filtered = filtered.filter(t => t.severity === 'MUST');
    }
    return {
      items: filtered,
      page: 1,
      pageSize: 20,
      total: filtered.length,
    };
  },

  getTaskDetail: async (taskId: string) => {
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) throw new Error('Task not found');
    
    return {
      ...task,
      fieldContext: { fieldId: 'f_001', fieldName: 'employee_id', dataType: 'VARCHAR(20)' },
      candidates: [
        { fieldSemanticType: 'IDENTIFIER', fieldRole: 'PRIMARY_KEY', confidence: 0.91, label: 'Recommended', evidenceRefs: ['ev_1', 'ev_2'] },
        { fieldSemanticType: 'TEXT', fieldRole: 'DIMENSION', confidence: 0.55, label: 'Alt', evidenceRefs: ['ev_3'] },
      ],
      evidenceSummary: [
        { type: 'NAMING_PATTERN', title: 'Naming match *_id', weight: 0.92, summary: '+92' },
        { type: 'PROFILE_STATS', title: 'Unique/NotNull Rate', weight: 0.80, summary: 'unique 87.3%' },
      ],
      actions: {
        canPreviewBatch: true,
        suggestedStrategies: ['ACCEPT_RECOMMENDED', 'REUSE_HISTORY', 'OPEN_EXCEPTION'],
      },
    };
  },

  getReleases: async () => {
    return {
      items: releases,
      page: 1,
      pageSize: 20,
      total: releases.length,
    };
  },

  previewBatch: async (strategy: string, taskIds: string[]) => {
    return {
      draftBatchId: 'batch_draft_' + Math.random().toString(36).substr(2, 5),
      strategy,
      changes: taskIds.map(id => ({
        entityType: 'FIELD_DECISION',
        lvId: 'lv_005',
        entityId: 'f_' + id,
        before: { fieldSemanticType: 'UNKNOWN', fieldRole: 'UNKNOWN' },
        after: { fieldSemanticType: 'IDENTIFIER', fieldRole: 'PRIMARY_KEY', keyFlags: { isPK: true } },
        evidenceRefs: ['ev_1'],
      })),
      impactSummary: {
        affectedDownstreams: 16,
        affectedObjects: 1,
        gateDelta: {
          mustOpenCount: { before: 1, after: 0 },
          coverage: { before: 0.78, after: 0.84 },
          riskLevel: { before: 'HIGH', after: 'MEDIUM' },
        },
      },
    };
  },

  commitBatch: async (draftBatchId: string) => {
    return {
      batchId: 'batch_' + Math.random().toString(36).substr(2, 5),
      status: 'COMMITTED',
      updatedGate: { mustOpenCount: 0, coverage: 0.84, riskLevel: 'MEDIUM' },
    };
  },

  getLogicalView: async (lvId: string) => {
    // Mock LV Data
    return {
      lvId,
      name: 't_hr_employee',
      description: 'Employee Master Data with current active status and department info',
      domain: 'HR',
      owner: 'Data Governance Team',
      status: 'DRAFT',
      fields: [
        { id: 'f_001', name: 'employee_id', dataType: 'VARCHAR(20)', semanticType: 'IDENTIFIER', description: 'Unique Employee ID', status: 'VERIFIED' },
        { id: 'f_002', name: 'first_name', dataType: 'VARCHAR(50)', semanticType: 'TEXT', description: 'First Name', status: 'VERIFIED' },
        { id: 'f_003', name: 'last_name', dataType: 'VARCHAR(50)', semanticType: 'TEXT', description: 'Last Name', status: 'VERIFIED' },
        { id: 'f_004', name: 'email', dataType: 'VARCHAR(100)', semanticType: 'CONTACT', description: 'Corporate Email', status: 'VERIFIED' },
        { id: 'f_005', name: 'dept_code', dataType: 'VARCHAR(10)', semanticType: 'FOREIGN_KEY', description: 'Department Code', status: 'WARNING', issue: 'Unresolved Reference' },
        { id: 'f_006', name: 'join_date', dataType: 'DATE', semanticType: 'TIME', description: 'Date of Joining', status: 'VERIFIED' },
        { id: 'f_007', name: 'salary_amt', dataType: 'DECIMAL(18,2)', semanticType: 'AMOUNT', description: 'Annual Salary', status: 'SENSITIVE' },
      ],
      lineage: {
        upstream: ['hr_db.employees', 'hr_db.departments'],
        downstream: ['rpt_headcount_monthly', 'dashboard_hr_overview']
      }
    };
  },

  getBusinessObjects: async (lvId: string) => {
    // Mock Business Object Generation Result
    return {
      lvId,
      metrics: {
        coverage: 0.85,
        unassignedCount: 4,
        conflictCount: 2,
      },
      objects: [
        {
          id: 'bo_001',
          name: 'Employee',
          type: 'PRIMARY',
          description: 'Core employee entity derived from main cluster',
          fieldCount: 15,
          attributes: [
            { id: 'attr_001', name: 'employee_id', type: 'ID', mappedField: 'emp_id', evidence: 'Primary Key Candidate (99%)', status: 'CONFIRMED', qualityRules: ['NOT_NULL', 'UNIQUE'] },
            { id: 'attr_002', name: 'full_name', type: 'ATTRIBUTE', mappedField: 'name_full', evidence: 'Semantic Name Match', status: 'CONFIRMED', qualityRules: ['NOT_NULL'] },
            { id: 'attr_003', name: 'email_address', type: 'ATTRIBUTE', mappedField: 'corp_email', evidence: 'Pattern Match (Email)', status: 'CONFIRMED', qualityRules: ['EMAIL_FORMAT', 'UNIQUE'] },
            { id: 'attr_004', name: 'annual_salary', type: 'MEASURE', mappedField: 'salary_amt', evidence: 'Numeric Currency', status: 'SUGGESTED', qualityRules: ['POSITIVE'] },
            { id: 'attr_005', name: 'hire_date', type: 'DIMENSION', mappedField: 'join_dt', evidence: 'Temporal Field', status: 'CONFIRMED', qualityRules: ['NOT_NULL', 'PAST_DATE'] },
            { id: 'attr_006', name: 'phone_number', type: 'ATTRIBUTE', mappedField: 'mobile_no', evidence: 'Pattern Match (Phone)', status: 'SUGGESTED', qualityRules: ['PHONE_FORMAT'] },
            { id: 'attr_007', name: 'job_title', type: 'DIMENSION', mappedField: 'designation', evidence: 'Categorical', status: 'CONFIRMED', qualityRules: [] },
            { id: 'attr_008', name: 'manager_id', type: 'ATTRIBUTE', mappedField: 'mgr_id', evidence: 'Self Reference', status: 'SUGGESTED', qualityRules: ['REF_INTEGRITY'] },
            { id: 'attr_009', name: 'dept_code', type: 'DIMENSION', mappedField: 'dept_cd', evidence: '外键模式', status: 'CONFIRMED', qualityRules: ['NOT_NULL'] },
            { id: 'attr_010', name: 'is_active', type: 'DIMENSION', mappedField: 'active_flg', evidence: 'Boolean', status: 'CONFIRMED', qualityRules: ['BOOLEAN'] },
            { id: 'attr_011', name: 'work_location', type: 'DIMENSION', mappedField: 'loc_id', evidence: 'Reference Pattern', status: 'CONFIRMED', qualityRules: [] },
            { id: 'attr_012', name: 'cost_center', type: 'ATTRIBUTE', mappedField: 'cc_code', evidence: 'Semantic Match', status: 'SUGGESTED', qualityRules: [] },
          ]
        },
        {
          id: 'bo_002',
          name: 'DepartmentRef',
          type: 'REFERENCE',
          description: 'Inferred reference object from department columns',
          fieldCount: 4,
          attributes: [
            { id: 'attr_013', name: 'department_id', type: 'ID', mappedField: 'dept_code', evidence: 'Foreign Key Pattern', status: 'CONFIRMED' },
            { id: 'attr_014', name: 'department_name', type: 'ATTRIBUTE', mappedField: 'dept_name', evidence: 'Co-occurrence with dept_code', status: 'SUGGESTED' },
            { id: 'attr_015', name: 'dept_head_id', type: 'ATTRIBUTE', mappedField: 'dept_mgr', evidence: 'Semantic Role', status: 'SUGGESTED' },
          ]
        },
        {
          id: 'bo_004',
          name: 'Project',
          type: 'REFERENCE',
          description: 'Project metadata inferred from project-related fields',
          fieldCount: 5,
          attributes: [
            { id: 'attr_031', name: 'project_id', type: 'ID', mappedField: 'proj_id', evidence: 'PK Pattern', status: 'CONFIRMED' },
            { id: 'attr_032', name: 'project_name', type: 'ATTRIBUTE', mappedField: 'proj_name', evidence: 'Semantic Match', status: 'CONFIRMED' },
            { id: 'attr_033', name: 'budget_amt', type: 'MEASURE', mappedField: 'proj_budget', evidence: 'Numeric Currency', status: 'SUGGESTED' },
          ]
        },
        {
          id: 'bo_005',
          name: 'Assignment',
          type: 'PRIMARY',
          description: 'Junction object for Employee-Project allocation',
          fieldCount: 4,
          attributes: [
            { id: 'attr_041', name: 'assignment_id', type: 'ID', mappedField: 'asgn_id', evidence: 'PK Pattern', status: 'CONFIRMED' },
            { id: 'attr_042', name: 'employee_id', type: 'ATTRIBUTE', mappedField: 'emp_id', evidence: 'FK Pattern', status: 'CONFIRMED' },
            { id: 'attr_043', name: 'project_id', type: 'ATTRIBUTE', mappedField: 'proj_id', evidence: 'FK Pattern', status: 'CONFIRMED' },
            { id: 'attr_044', name: 'allocation_pct', type: 'MEASURE', mappedField: 'alloc_rate', evidence: 'Percentage Pattern', status: 'SUGGESTED' },
          ]
        },
        {
          id: 'bo_003',
          name: 'AuditLog',
          type: 'LOG',
          description: 'System audit fields separated from business logic',
          fieldCount: 3,
          attributes: [
            { id: 'attr_021', name: 'created_at', type: 'DIMENSION', mappedField: 'crt_ts', evidence: 'Audit Pattern', status: 'CONFIRMED' },
            { id: 'attr_022', name: 'created_by', type: 'ATTRIBUTE', mappedField: 'crt_user', evidence: 'Audit Pattern', status: 'CONFIRMED' },
            { id: 'attr_023', name: 'updated_at', type: 'DIMENSION', mappedField: 'upd_ts', evidence: 'Audit Pattern', status: 'CONFIRMED' },
          ]
        }
      ],
      unassignedFields: [
        { id: 'f_901', name: 'temp_flag', dataType: 'CHAR(1)', reason: 'Low utility', group: 'TECHNICAL' },
        { id: 'f_902', name: 'legacy_id', dataType: 'VARCHAR(20)', reason: 'Ambiguous mapping', group: 'UNASSIGNED' },
        { id: 'f_903', name: 'etl_batch_id', dataType: 'VARCHAR(50)', reason: 'Technical field', group: 'TECHNICAL' },
        { id: 'f_904', name: 'unknown_col', dataType: 'VARCHAR(100)', reason: 'No semantic match', group: 'UNASSIGNED' },
        { id: 'f_905', name: 'manager_id', dataType: 'VARCHAR(20)', reason: '既可属于 Employee 又可属于 Manager', group: 'CONFLICT' },
        { id: 'f_906', name: 'debug_info', dataType: 'TEXT', reason: 'Internal use only', group: 'TECHNICAL' },
        { id: 'f_907', name: 'raw_payload', dataType: 'JSON', reason: 'Unstructured data', group: 'UNASSIGNED' },
      ],
      tableContext: {
        sourceTable: 't_employee_profile',
        businessDomain: 'HR / 员工中心',
        totalFields: 32,
        objectCoverage: 0.81,
        unassignedCount: 4,
        conflictCount: 1,
      },
      tableView: [
        { field: 'employee_id', attribute: 'employeeId', object: 'Employee' },
        { field: 'name_full', attribute: 'fullName', object: 'Employee' },
        { field: 'corp_email', attribute: 'email', object: 'Employee' },
        { field: 'mgr_id', attribute: 'managerId', object: 'Employee' },
        { field: 'dept_cd', attribute: 'departmentId', object: 'DepartmentRef' },
        { field: 'proj_id', attribute: 'projectId', object: 'Project' },
        { field: 'asgn_id', attribute: 'assignmentId', object: 'Assignment' },
      ],
      relationships: [
        { 
          source: 'Employee', 
          target: 'DepartmentRef', 
          type: 'Foreign Key', 
          keys: 'dept_code (FK) -> department_id (PK)', 
          field: 'dept_code',
          evidence: 'Reasoning LLM: Semantic & Pattern Match', 
          confidence: 0.99 
        },
        { 
          source: 'Employee', 
          target: 'Assignment', 
          type: 'One-to-Many', 
          keys: 'employee_id -> employee_id', 
          field: 'employee_id',
          evidence: 'Primary Key to Foreign Key mapping', 
          confidence: 0.98 
        },
        { 
          source: 'Project', 
          target: 'Assignment', 
          type: 'One-to-Many', 
          keys: 'project_id -> project_id', 
          field: 'project_id',
          evidence: 'Reference integrity detected', 
          confidence: 0.97 
        },
        { 
          source: 'Employee', 
          target: 'AuditLog', 
          type: 'Association', 
          keys: 'employee_id -> created_by', 
          field: 'employee_id',
          evidence: 'User ID pattern match in audit fields', 
          confidence: 0.85 
        },
        { 
          source: 'Employee', 
          target: 'Employee', 
          type: 'Self-Reference', 
          keys: 'manager_id -> employee_id', 
          field: 'manager_id',
          evidence: 'Recursive relationship detected', 
          confidence: 0.92 
        }
      ]
    };
  },

  copilotInterpret: async (text: string, context?: string) => {
    // Mock interpretation logic based on context
    if (context?.includes('/semantic/objects')) {
      if (text.includes('分析') || text.includes('结构')) {
        return {
          commands: [
            {
              command: 'OBJECT.ANALYZE',
              intentId: 'it_obj_001',
              payload: { scope: { type: 'LV', lvId: 'lv_005' }, steps: ['扫描物理字段', '推断语义属性', '构建关系图谱'] },
              uiHints: { primaryCTA: '执行分析', openRoute: '/semantic/objects/lv_005' },
              explain: "我将为你分析当前表的语义结构，并生成对象候选和关系图谱。",
            },
          ],
        };
      }
      if (text.includes('拆分')) {
        return {
          commands: [
            {
              command: 'OBJECT.SPLIT_SUGGESTION',
              intentId: 'it_obj_002',
              payload: { strategy: 'SENSITIVITY_AND_FREQUENCY', scope: { type: 'OBJECT', id: 'obj_001' } },
              uiHints: { primaryCTA: '查看拆分建议', openRoute: '/semantic/objects/lv_005' },
              explain: "根据分析，该对象包含核心身份信息和敏感薪资两类语义簇。拆分后可提升数据安全管控粒度，并降低下游模型理解风险。",
            },
          ],
        };
      }
    }

    if (context?.includes('/semantic/table-understanding')) {
      if (text.includes('类型') || text.includes('推荐')) {
        return {
          commands: [
            {
              command: 'TABLE.EXPLAIN_TYPE',
              intentId: 'it_tu_001',
              payload: { tableType: 'DIMENSION' },
              uiHints: { primaryCTA: '查看详细推理', openRoute: '/semantic/table-understanding/lv_005' },
              explain: "AI 推荐该表为维度表（DIMENSION），因为该表包含大量描述性属性（如姓名、部门、职级），且被多个事实表（如考勤、发薪）作为外键引用，符合典型维度表特征。",
            },
          ],
        };
      }
      if (text.includes('主键') || text.includes('质量')) {
        return {
          commands: [
            {
              command: 'TABLE.CHECK_PK',
              intentId: 'it_tu_002',
              payload: { pk: 'employee_id' },
              uiHints: { primaryCTA: '查看主键分析', openRoute: '/semantic/table-understanding/lv_005' },
              explain: "当前推荐的主键为 employee_id。经过分析，该字段 100% 唯一，无空值，且存在物理主键约束，质量极高。另一个候选键 ssn_number 存在少量空值，不建议作为物理主键。",
            },
          ],
        };
      }
      if (text.includes('下游') || text.includes('依赖')) {
        return {
          commands: [
            {
              command: 'TABLE.DOWNSTREAM',
              intentId: 'it_tu_003',
              payload: { downstreams: 24 },
              uiHints: { primaryCTA: '查看血缘关系', openRoute: '/semantic/table-understanding/lv_005' },
              explain: "该表作为核心维度表，共有 24 个下游依赖。常用于按 department_id 分组聚合，常与 fact_payroll 进行 JOIN。其主键和部门外键的变更将直接影响下游 12 个核心报表的数据准确性。",
            },
          ],
        };
      }
      return {
        commands: [
          {
            command: 'TABLE.GENERAL',
            intentId: 'it_tu_004',
            payload: {},
            explain: "这里是表理解页面，你可以向我询问关于表类型推荐、主外键质量分析、下游依赖影响等问题。",
          },
        ],
      };
    }

    if (context?.includes('/semantic/releases')) {
      if (text.includes('预览') || text.includes('发布')) {
         return {
          commands: [
            {
              command: 'RELEASE.PREVIEW',
              intentId: 'it_rel_001',
              payload: { scope: { type: 'LV', lvId: 'lv_005' }, steps: ['检查质量门禁', '生成变更日志', '评估下游影响'] },
              uiHints: { primaryCTA: '生成预览报告', openRoute: '/semantic/releases' },
              explain: "我已经为你准备好了发布预览报告，包含质量门禁状态和变更影响评估。",
            },
          ],
        };
      }
    }

    if (text.toLowerCase().includes('plan') || text.toLowerCase().includes('understand') || text.includes('理解')) {
      return {
        commands: [
          {
            command: 'PLAN.UNDERSTAND',
            intentId: 'it_003',
            payload: { scope: { type: 'LV', lvId: 'lv_005' }, steps: ['Analyze Schema', 'Check Downstreams', 'Scan Data Profile'] },
            uiHints: { primaryCTA: 'Run Understanding', openRoute: '/semantic/workbench/lv_005' },
            explain: "我可以为这个逻辑视图运行一个全面的理解计划。",
          },
        ],
      };
    }
    if (text.includes('MUST') || text.includes('must') || text.includes('阻断')) {
      return {
        commands: [
          {
            command: 'BATCH.PREVIEW',
            intentId: 'it_001',
            payload: { strategy: 'AUTO_PASS_FIELDS', scope: { type: 'LV', lvId: 'lv_005' }, constraints: { minConfidence: 0.85 } },
            uiHints: { primaryCTA: 'Preview', openRoute: '/semantic/inbox' },
            explain: "我已经准备好了一个批量预览，可以自动解决高置信度的 MUST 阻断项。",
          },
        ],
      };
    }
    return {
      commands: [
        {
          command: 'TASKS.FILTER',
          intentId: 'it_002',
          payload: { quickFilter: 'CONFLICT' },
          explain: "正在筛选待办箱，仅显示冲突项。",
        },
      ],
    };
  },
};
