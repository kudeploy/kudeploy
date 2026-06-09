/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /**
   * A filter for ApiKey that accepts MongoDB query syntax.
   * Supported fields: name, key_prefix, created_at
   */
  ApiKeyFilter: { input: any; output: any };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any };
  /**
   * A filter for Deployment that accepts MongoDB query syntax.
   * Supported fields: version, image, status, createdAt
   */
  DeploymentFilter: { input: any; output: any };
  /**
   * A filter for Domain that accepts MongoDB query syntax.
   * Supported fields: name, status, created_at
   */
  DomainFilter: { input: any; output: any };
  /**
   * A filter for Project that accepts MongoDB query syntax.
   * Supported fields: name, createdAt
   */
  ProjectFilter: { input: any; output: any };
  /**
   * A filter for Service that accepts MongoDB query syntax.
   * Supported fields: name, createdAt
   */
  ServiceFilter: { input: any; output: any };
  /**
   * A filter for Workspace that accepts MongoDB query syntax.
   * Supported fields: name, created_at
   */
  WorkspaceFilter: { input: any; output: any };
  /**
   * A filter for WorkspaceMember that accepts MongoDB query syntax.
   * Supported fields: name, role, type, email, status, created_at
   */
  WorkspaceMemberFilter: { input: any; output: any };
  /**
   * A filter for WorkspaceMemberGroup that accepts MongoDB query syntax.
   * Supported fields: name, description, created_at
   */
  WorkspaceMemberGroupFilter: { input: any; output: any };
};

export type AcceptWorkspaceInviteInput = {
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type AcceptWorkspaceInviteResult = {
  __typename?: "AcceptWorkspaceInviteResult";
  workspaceId: Scalars["ID"]["output"];
  workspaceMember: WorkspaceMember;
};

export type AddWorkspaceMemberInput = {
  email: Scalars["String"]["input"];
};

export type ApiKey = {
  __typename?: "ApiKey";
  createdAt: Scalars["DateTime"]["output"];
  expiresAt?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  keyPrefix: Scalars["String"]["output"];
  lastUsedAt?: Maybe<Scalars["DateTime"]["output"]>;
  member: WorkspaceMember;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type ApiKeyConnection = {
  __typename?: "ApiKeyConnection";
  /** A list of edges. */
  edges: Array<ApiKeyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars["Int"]["output"];
};

/** An auto-generated type which holds one ApiKey and a cursor during pagination. */
export type ApiKeyEdge = {
  __typename?: "ApiKeyEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The item at the end of ApiKeyEdge. */
  node: ApiKey;
};

/** Ordering options for apikey connections */
export type ApiKeyOrder = {
  /** The ordering direction. */
  direction: OrderDirection;
  /** The field to order apikeys by. */
  field: ApiKeyOrderField;
};

/** Properties by which apikey connections can be ordered. */
export enum ApiKeyOrderField {
  CREATED_AT = "CREATED_AT",
  ID = "ID",
}

export type CreateApiKeyInput = {
  expiresAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  name: Scalars["String"]["input"];
  workspaceMemberId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type CreateApiKeyResult = {
  __typename?: "CreateApiKeyResult";
  apiKey: Scalars["String"]["output"];
  entity: ApiKey;
};

export type CreateDomainInput = {
  name: Scalars["String"]["input"];
};

export type CreateProjectInput = {
  name: Scalars["String"]["input"];
};

export type CreateServiceAccountWorkspaceMemberInput = {
  name: Scalars["String"]["input"];
  permissions?: InputMaybe<Array<WorkspacePermission>>;
  role?: InputMaybe<WorkspaceMemberRole>;
};

export type CreateServiceInput = {
  args?: InputMaybe<Array<Scalars["String"]["input"]>>;
  command?: InputMaybe<Array<Scalars["String"]["input"]>>;
  env?: InputMaybe<Array<ServiceEnvVarInput>>;
  healthCheck?: InputMaybe<ServiceHealthCheckInput>;
  image: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  ports: Array<ServicePortInput>;
  projectId: Scalars["ID"]["input"];
  replicas?: InputMaybe<Scalars["Int"]["input"]>;
  resources?: InputMaybe<ServiceResourcesInput>;
};

export type CreateWorkspaceInput = {
  name: Scalars["String"]["input"];
};

export type CreateWorkspaceInviteInput = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  role: WorkspaceMemberRole;
};

export type CreateWorkspaceMemberGroupInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  memberIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
  name: Scalars["String"]["input"];
  permissions?: InputMaybe<Array<WorkspacePermission>>;
};

export type Deployment = {
  __typename?: "Deployment";
  active: Scalars["Boolean"]["output"];
  args: Array<Scalars["String"]["output"]>;
  command: Array<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  env: Array<DeploymentEnvVar>;
  envFrom: Array<DeploymentEnvFrom>;
  id: Scalars["ID"]["output"];
  image: Scalars["String"]["output"];
  kubernetesDeploymentName?: Maybe<Scalars["String"]["output"]>;
  latest: Scalars["Boolean"]["output"];
  ports: Array<DeploymentPort>;
  projectId: Scalars["ID"]["output"];
  replicas?: Maybe<Scalars["Int"]["output"]>;
  resources?: Maybe<DeploymentResources>;
  serviceAccountName?: Maybe<Scalars["String"]["output"]>;
  serviceId: Scalars["ID"]["output"];
  status: DeploymentStatus;
  updatedAt: Scalars["DateTime"]["output"];
  version: Scalars["Int"]["output"];
};

export type DeploymentConnection = {
  __typename?: "DeploymentConnection";
  /** A list of edges. */
  edges: Array<DeploymentEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars["Int"]["output"];
};

/** An auto-generated type which holds one Deployment and a cursor during pagination. */
export type DeploymentEdge = {
  __typename?: "DeploymentEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The item at the end of DeploymentEdge. */
  node: Deployment;
};

export type DeploymentEnvFrom = {
  __typename?: "DeploymentEnvFrom";
  kind: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  prefix?: Maybe<Scalars["String"]["output"]>;
};

export type DeploymentEnvVar = {
  __typename?: "DeploymentEnvVar";
  name: Scalars["String"]["output"];
  value?: Maybe<Scalars["String"]["output"]>;
};

/** Ordering options for deployment connections */
export type DeploymentOrder = {
  /** The ordering direction. */
  direction: OrderDirection;
  /** The field to order deployments by. */
  field: DeploymentOrderField;
};

/** Properties by which deployment connections can be ordered. */
export enum DeploymentOrderField {
  CREATED_AT = "CREATED_AT",
  ID = "ID",
  STATUS = "STATUS",
  VERSION = "VERSION",
}

export type DeploymentPort = {
  __typename?: "DeploymentPort";
  port: Scalars["Int"]["output"];
  targetPort?: Maybe<Scalars["Int"]["output"]>;
};

export type DeploymentResources = {
  __typename?: "DeploymentResources";
  cpuLimit?: Maybe<Scalars["String"]["output"]>;
  cpuRequest?: Maybe<Scalars["String"]["output"]>;
  memoryLimit?: Maybe<Scalars["String"]["output"]>;
  memoryRequest?: Maybe<Scalars["String"]["output"]>;
};

export enum DeploymentStatus {
  FAILED = "FAILED",
  PENDING = "PENDING",
  PROGRESSING = "PROGRESSING",
  READY = "READY",
  UNKNOWN = "UNKNOWN",
}

export type Domain = {
  __typename?: "Domain";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  status: DomainStatus;
  updatedAt: Scalars["DateTime"]["output"];
  verificationToken: Scalars["String"]["output"];
  verifiedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type DomainConnection = {
  __typename?: "DomainConnection";
  /** A list of edges. */
  edges: Array<DomainEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars["Int"]["output"];
};

/** An auto-generated type which holds one Domain and a cursor during pagination. */
export type DomainEdge = {
  __typename?: "DomainEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The item at the end of DomainEdge. */
  node: Domain;
};

/** Ordering options for domain connections */
export type DomainOrder = {
  /** The ordering direction. */
  direction: OrderDirection;
  /** The field to order domains by. */
  field: DomainOrderField;
};

/** Properties by which domain connections can be ordered. */
export enum DomainOrderField {
  CREATED_AT = "CREATED_AT",
  ID = "ID",
  NAME = "NAME",
  STATUS = "STATUS",
}

export enum DomainStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
}

export type KubernetesMetricPoint = {
  __typename?: "KubernetesMetricPoint";
  timestamp: Scalars["DateTime"]["output"];
  value: Scalars["Float"]["output"];
};

export type Mutation = {
  __typename?: "Mutation";
  acceptWorkspaceInvite: AcceptWorkspaceInviteResult;
  addMembersToWorkspaceMemberGroup: WorkspaceMemberGroup;
  addWorkspaceMember: WorkspaceMember;
  createApiKey: CreateApiKeyResult;
  createDomain: Domain;
  createProject: Project;
  createService: Service;
  createServiceAccountWorkspaceMember: WorkspaceMember;
  createWorkspace: Workspace;
  createWorkspaceInvite: WorkspaceMember;
  createWorkspaceMemberGroup: WorkspaceMemberGroup;
  deleteApiKey: ApiKey;
  deleteDomain: Domain;
  deleteProject: Project;
  deleteService: Service;
  deleteWorkspace: Workspace;
  deleteWorkspaceMemberGroup: WorkspaceMemberGroup;
  removeMembersFromWorkspaceMemberGroup: WorkspaceMemberGroup;
  /** @deprecated Use deleteWorkspace instead */
  removeWorkspace: Workspace;
  removeWorkspaceMember: WorkspaceMember;
  updateApiKey: ApiKey;
  updateProject: Project;
  updateService: Service;
  updateWorkspace: Workspace;
  updateWorkspaceMember?: Maybe<WorkspaceMember>;
  updateWorkspaceMemberGroup: WorkspaceMemberGroup;
  verifyDomain: Domain;
};

export type MutationAcceptWorkspaceInviteArgs = {
  input?: InputMaybe<AcceptWorkspaceInviteInput>;
  token: Scalars["String"]["input"];
};

export type MutationAddMembersToWorkspaceMemberGroupArgs = {
  id: Scalars["ID"]["input"];
  memberIds: Array<Scalars["ID"]["input"]>;
};

export type MutationAddWorkspaceMemberArgs = {
  input: AddWorkspaceMemberInput;
};

export type MutationCreateApiKeyArgs = {
  input: CreateApiKeyInput;
};

export type MutationCreateDomainArgs = {
  input: CreateDomainInput;
};

export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};

export type MutationCreateServiceArgs = {
  input: CreateServiceInput;
};

export type MutationCreateServiceAccountWorkspaceMemberArgs = {
  input: CreateServiceAccountWorkspaceMemberInput;
};

export type MutationCreateWorkspaceArgs = {
  input: CreateWorkspaceInput;
};

export type MutationCreateWorkspaceInviteArgs = {
  input: CreateWorkspaceInviteInput;
};

export type MutationCreateWorkspaceMemberGroupArgs = {
  input: CreateWorkspaceMemberGroupInput;
};

export type MutationDeleteApiKeyArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteDomainArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteProjectArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteServiceArgs = {
  id: Scalars["ID"]["input"];
  projectId: Scalars["ID"]["input"];
};

export type MutationDeleteWorkspaceMemberGroupArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRemoveMembersFromWorkspaceMemberGroupArgs = {
  id: Scalars["ID"]["input"];
  memberIds: Array<Scalars["ID"]["input"]>;
};

export type MutationRemoveWorkspaceMemberArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationUpdateApiKeyArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateApiKeyInput;
};

export type MutationUpdateProjectArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateProjectInput;
};

export type MutationUpdateServiceArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateServiceInput;
  projectId: Scalars["ID"]["input"];
};

export type MutationUpdateWorkspaceArgs = {
  input: UpdateWorkspaceInput;
};

export type MutationUpdateWorkspaceMemberArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateWorkspaceMemberInput;
};

export type MutationUpdateWorkspaceMemberGroupArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateWorkspaceMemberGroupInput;
};

export type MutationVerifyDomainArgs = {
  id: Scalars["ID"]["input"];
};

export enum OrderDirection {
  ASC = "ASC",
  DESC = "DESC",
}

/** Returns information about pagination in a connection, in accordance with the [Relay specification](https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo). */
export type PageInfo = {
  __typename?: "PageInfo";
  endCursor?: Maybe<Scalars["String"]["output"]>;
  /** Whether there are more pages to fetch following the current page. */
  hasNextPage: Scalars["Boolean"]["output"];
  /** Whether there are any pages prior to the current page. */
  hasPreviousPage: Scalars["Boolean"]["output"];
  startCursor?: Maybe<Scalars["String"]["output"]>;
};

export type Project = {
  __typename?: "Project";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  status: ProjectStatus;
  updatedAt: Scalars["DateTime"]["output"];
};

export type ProjectConnection = {
  __typename?: "ProjectConnection";
  /** A list of edges. */
  edges: Array<ProjectEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars["Int"]["output"];
};

/** An auto-generated type which holds one Project and a cursor during pagination. */
export type ProjectEdge = {
  __typename?: "ProjectEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The item at the end of ProjectEdge. */
  node: Project;
};

/** Ordering options for project connections */
export type ProjectOrder = {
  /** The ordering direction. */
  direction: OrderDirection;
  /** The field to order projects by. */
  field: ProjectOrderField;
};

/** Properties by which project connections can be ordered. */
export enum ProjectOrderField {
  CREATED_AT = "CREATED_AT",
  ID = "ID",
}

export enum ProjectStatus {
  FAILED = "FAILED",
  PENDING = "PENDING",
  PROGRESSING = "PROGRESSING",
  READY = "READY",
  UNKNOWN = "UNKNOWN",
}

export type Query = {
  __typename?: "Query";
  apiKey?: Maybe<ApiKey>;
  apiKeys: ApiKeyConnection;
  currentUser: User;
  currentWorkspace?: Maybe<Workspace>;
  currentWorkspaceMember?: Maybe<WorkspaceMember>;
  deployment?: Maybe<Deployment>;
  deployments: DeploymentConnection;
  domain?: Maybe<Domain>;
  domains: DomainConnection;
  project?: Maybe<Project>;
  projects: ProjectConnection;
  service?: Maybe<Service>;
  services: ServiceConnection;
  workspace?: Maybe<Workspace>;
  workspaceMember?: Maybe<WorkspaceMember>;
  workspaceMemberByToken?: Maybe<WorkspaceMember>;
  workspaceMemberGroup: WorkspaceMemberGroup;
  workspaceMemberGroups: WorkspaceMemberGroupConnection;
  workspaceMembers: WorkspaceMemberConnection;
  workspaces: WorkspaceConnection;
};

export type QueryApiKeyArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryApiKeysArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["ApiKeyFilter"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ApiKeyOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryDeploymentArgs = {
  id: Scalars["ID"]["input"];
  projectId: Scalars["ID"]["input"];
};

export type QueryDeploymentsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["DeploymentFilter"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DeploymentOrder>;
  projectId: Scalars["ID"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
  serviceId: Scalars["ID"]["input"];
};

export type QueryDomainArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryDomainsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["DomainFilter"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<DomainOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryProjectArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryProjectsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["ProjectFilter"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ProjectOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryServiceArgs = {
  id: Scalars["ID"]["input"];
  projectId: Scalars["ID"]["input"];
};

export type QueryServicesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["ServiceFilter"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<ServiceOrder>;
  projectId: Scalars["ID"]["input"];
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryWorkspaceArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryWorkspaceMemberArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryWorkspaceMemberByTokenArgs = {
  token: Scalars["String"]["input"];
};

export type QueryWorkspaceMemberGroupArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryWorkspaceMemberGroupsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["WorkspaceMemberGroupFilter"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<WorkspaceMemberGroupOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryWorkspaceMembersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["WorkspaceMemberFilter"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<WorkspaceMemberOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryWorkspacesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["WorkspaceFilter"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<WorkspaceOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type Service = {
  __typename?: "Service";
  args: Array<Scalars["String"]["output"]>;
  command: Array<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  env: Array<ServiceEnvVar>;
  healthCheck?: Maybe<ServiceHealthCheck>;
  id: Scalars["ID"]["output"];
  image: Scalars["String"]["output"];
  logs: ServiceLogs;
  metrics: ServiceMetrics;
  name: Scalars["String"]["output"];
  ports: Array<ServicePort>;
  projectId: Scalars["ID"]["output"];
  replicas?: Maybe<Scalars["Int"]["output"]>;
  resources?: Maybe<ServiceResources>;
  status: ServiceStatus;
  updatedAt: Scalars["DateTime"]["output"];
};

export type ServiceLogsArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  rangeSeconds?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ServiceMetricsArgs = {
  rangeSeconds?: InputMaybe<Scalars["Int"]["input"]>;
  stepSeconds?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ServiceConnection = {
  __typename?: "ServiceConnection";
  /** A list of edges. */
  edges: Array<ServiceEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars["Int"]["output"];
};

/** An auto-generated type which holds one Service and a cursor during pagination. */
export type ServiceEdge = {
  __typename?: "ServiceEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The item at the end of ServiceEdge. */
  node: Service;
};

export type ServiceEnvVar = {
  __typename?: "ServiceEnvVar";
  key: Scalars["String"]["output"];
  value: Scalars["String"]["output"];
};

export type ServiceEnvVarInput = {
  key: Scalars["String"]["input"];
  value: Scalars["String"]["input"];
};

export type ServiceHealthCheck = {
  __typename?: "ServiceHealthCheck";
  path?: Maybe<Scalars["String"]["output"]>;
  port: Scalars["Int"]["output"];
  type: ServiceHealthCheckType;
};

export type ServiceHealthCheckInput = {
  path?: InputMaybe<Scalars["String"]["input"]>;
  port: Scalars["Int"]["input"];
  type: ServiceHealthCheckType;
};

export enum ServiceHealthCheckType {
  HTTP = "HTTP",
  TCP = "TCP",
}

export type ServiceLogEntry = {
  __typename?: "ServiceLogEntry";
  containerName?: Maybe<Scalars["String"]["output"]>;
  deploymentName?: Maybe<Scalars["String"]["output"]>;
  message: Scalars["String"]["output"];
  namespace?: Maybe<Scalars["String"]["output"]>;
  podName?: Maybe<Scalars["String"]["output"]>;
  timestamp: Scalars["DateTime"]["output"];
};

export type ServiceLogs = {
  __typename?: "ServiceLogs";
  available: Scalars["Boolean"]["output"];
  entries: Array<ServiceLogEntry>;
  limit: Scalars["Int"]["output"];
  rangeSeconds: Scalars["Int"]["output"];
};

export type ServiceMetrics = {
  __typename?: "ServiceMetrics";
  available: Scalars["Boolean"]["output"];
  cpuLimitMillicores?: Maybe<Scalars["Float"]["output"]>;
  cpuUsageMillicores: Array<KubernetesMetricPoint>;
  memoryLimitBytes?: Maybe<Scalars["Float"]["output"]>;
  memoryUsageBytes: Array<KubernetesMetricPoint>;
  networkReceiveBytesPerSecond: Array<KubernetesMetricPoint>;
  networkTransmitBytesPerSecond: Array<KubernetesMetricPoint>;
  rangeSeconds: Scalars["Int"]["output"];
  stepSeconds: Scalars["Int"]["output"];
};

/** Ordering options for service connections */
export type ServiceOrder = {
  /** The ordering direction. */
  direction: OrderDirection;
  /** The field to order services by. */
  field: ServiceOrderField;
};

/** Properties by which service connections can be ordered. */
export enum ServiceOrderField {
  CREATED_AT = "CREATED_AT",
  ID = "ID",
}

export type ServicePort = {
  __typename?: "ServicePort";
  port: Scalars["Int"]["output"];
  targetPort?: Maybe<Scalars["Int"]["output"]>;
};

export type ServicePortInput = {
  port: Scalars["Int"]["input"];
  targetPort?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ServiceResources = {
  __typename?: "ServiceResources";
  cpuLimit?: Maybe<Scalars["String"]["output"]>;
  cpuRequest?: Maybe<Scalars["String"]["output"]>;
  memoryLimit?: Maybe<Scalars["String"]["output"]>;
  memoryRequest?: Maybe<Scalars["String"]["output"]>;
};

export type ServiceResourcesInput = {
  cpuLimit?: InputMaybe<Scalars["String"]["input"]>;
  cpuRequest?: InputMaybe<Scalars["String"]["input"]>;
  memoryLimit?: InputMaybe<Scalars["String"]["input"]>;
  memoryRequest?: InputMaybe<Scalars["String"]["input"]>;
};

export enum ServiceStatus {
  FAILED = "FAILED",
  PENDING = "PENDING",
  PROGRESSING = "PROGRESSING",
  READY = "READY",
  UNKNOWN = "UNKNOWN",
}

export type UpdateApiKeyInput = {
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateProjectInput = {
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateServiceInput = {
  args?: InputMaybe<Array<Scalars["String"]["input"]>>;
  command?: InputMaybe<Array<Scalars["String"]["input"]>>;
  env?: InputMaybe<Array<ServiceEnvVarInput>>;
  healthCheck?: InputMaybe<ServiceHealthCheckInput>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  ports?: InputMaybe<Array<ServicePortInput>>;
  replicas?: InputMaybe<Scalars["Int"]["input"]>;
  resources?: InputMaybe<ServiceResourcesInput>;
};

export type UpdateWorkspaceInput = {
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateWorkspaceMemberGroupInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  permissions?: InputMaybe<Array<WorkspacePermission>>;
};

export type UpdateWorkspaceMemberInput = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  permissions?: InputMaybe<Array<WorkspacePermission>>;
  role?: InputMaybe<WorkspaceMemberRole>;
  status?: InputMaybe<WorkspaceMemberStatus>;
};

export type User = {
  __typename?: "User";
  createdAt: Scalars["DateTime"]["output"];
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type Workspace = {
  __typename?: "Workspace";
  createdAt: Scalars["DateTime"]["output"];
  deletedAt?: Maybe<Scalars["DateTime"]["output"]>;
  features: Array<WorkspaceFeature>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type WorkspaceConnection = {
  __typename?: "WorkspaceConnection";
  /** A list of edges. */
  edges: Array<WorkspaceEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars["Int"]["output"];
};

/** An auto-generated type which holds one Workspace and a cursor during pagination. */
export type WorkspaceEdge = {
  __typename?: "WorkspaceEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The item at the end of WorkspaceEdge. */
  node: Workspace;
};

export enum WorkspaceFeature {
  AI = "AI",
}

export type WorkspaceMember = {
  __typename?: "WorkspaceMember";
  createdAt: Scalars["DateTime"]["output"];
  effectivePermissions: Array<WorkspacePermission>;
  email?: Maybe<Scalars["String"]["output"]>;
  groups: WorkspaceMemberGroupConnection;
  id: Scalars["ID"]["output"];
  inviteExpiresAt?: Maybe<Scalars["DateTime"]["output"]>;
  inviteToken?: Maybe<Scalars["String"]["output"]>;
  invitedBy?: Maybe<User>;
  invitedByUserName?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  permissions: Array<WorkspacePermission>;
  role: WorkspaceMemberRole;
  status: WorkspaceMemberStatus;
  type: WorkspaceMemberType;
  updatedAt: Scalars["DateTime"]["output"];
  user?: Maybe<User>;
};

export type WorkspaceMemberGroupsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["WorkspaceMemberGroupFilter"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<WorkspaceMemberGroupOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type WorkspaceMemberConnection = {
  __typename?: "WorkspaceMemberConnection";
  /** A list of edges. */
  edges: Array<WorkspaceMemberEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars["Int"]["output"];
};

/** An auto-generated type which holds one WorkspaceMember and a cursor during pagination. */
export type WorkspaceMemberEdge = {
  __typename?: "WorkspaceMemberEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The item at the end of WorkspaceMemberEdge. */
  node: WorkspaceMember;
};

export type WorkspaceMemberGroup = {
  __typename?: "WorkspaceMemberGroup";
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  members: WorkspaceMemberConnection;
  name: Scalars["String"]["output"];
  permissions: Array<WorkspacePermission>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type WorkspaceMemberGroupMembersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["WorkspaceMemberFilter"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<WorkspaceMemberOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type WorkspaceMemberGroupConnection = {
  __typename?: "WorkspaceMemberGroupConnection";
  /** A list of edges. */
  edges: Array<WorkspaceMemberGroupEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars["Int"]["output"];
};

/** An auto-generated type which holds one WorkspaceMemberGroup and a cursor during pagination. */
export type WorkspaceMemberGroupEdge = {
  __typename?: "WorkspaceMemberGroupEdge";
  /** A cursor for use in pagination. */
  cursor: Scalars["String"]["output"];
  /** The item at the end of WorkspaceMemberGroupEdge. */
  node: WorkspaceMemberGroup;
};

/** Ordering options for workspacemembergroup connections */
export type WorkspaceMemberGroupOrder = {
  /** The ordering direction. */
  direction: OrderDirection;
  /** The field to order workspacemembergroups by. */
  field: WorkspaceMemberGroupOrderField;
};

/** Properties by which workspacemembergroup connections can be ordered. */
export enum WorkspaceMemberGroupOrderField {
  CREATED_AT = "CREATED_AT",
  ID = "ID",
}

/** Ordering options for workspacemember connections */
export type WorkspaceMemberOrder = {
  /** The ordering direction. */
  direction: OrderDirection;
  /** The field to order workspacemembers by. */
  field: WorkspaceMemberOrderField;
};

/** Properties by which workspacemember connections can be ordered. */
export enum WorkspaceMemberOrderField {
  CREATED_AT = "CREATED_AT",
  ID = "ID",
}

export enum WorkspaceMemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  OWNER = "OWNER",
}

export enum WorkspaceMemberStatus {
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
  INVITE_EXPIRED = "INVITE_EXPIRED",
  INVITING = "INVITING",
}

export enum WorkspaceMemberType {
  SERVICE_ACCOUNT = "SERVICE_ACCOUNT",
  USER = "USER",
}

/** Ordering options for workspace connections */
export type WorkspaceOrder = {
  /** The ordering direction. */
  direction: OrderDirection;
  /** The field to order workspaces by. */
  field: WorkspaceOrderField;
};

/** Properties by which workspace connections can be ordered. */
export enum WorkspaceOrderField {
  CREATED_AT = "CREATED_AT",
  ID = "ID",
}

export enum WorkspacePermission {
  MANAGE_DOMAINS = "MANAGE_DOMAINS",
  MANAGE_MEMBERS = "MANAGE_MEMBERS",
  MANAGE_WORKSPACE = "MANAGE_WORKSPACE",
}

export type GetCurrentUserFromAuthenticatedRouteQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCurrentUserFromAuthenticatedRouteQuery = {
  __typename?: "Query";
  currentUser: { __typename?: "User"; id: string };
};

export type GetApiKeysFromApiKeysRouteQueryVariables = Exact<{
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  filter?: InputMaybe<Scalars["ApiKeyFilter"]["input"]>;
  orderBy?: InputMaybe<ApiKeyOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetApiKeysFromApiKeysRouteQuery = {
  __typename?: "Query";
  apiKeys: {
    __typename?: "ApiKeyConnection";
    edges: Array<{
      __typename?: "ApiKeyEdge";
      node: {
        __typename?: "ApiKey";
        id: string;
        name: string;
        keyPrefix: string;
        createdAt: any;
        lastUsedAt?: any | null;
        expiresAt?: any | null;
        member: {
          __typename?: "WorkspaceMember";
          id: string;
          name: string;
          email?: string | null;
        };
      };
    }>;
    pageInfo: {
      __typename?: "PageInfo";
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type CreateApiKeyFromApiKeysRouteMutationVariables = Exact<{
  input: CreateApiKeyInput;
}>;

export type CreateApiKeyFromApiKeysRouteMutation = {
  __typename?: "Mutation";
  createApiKey: {
    __typename?: "CreateApiKeyResult";
    apiKey: string;
    entity: {
      __typename?: "ApiKey";
      id: string;
      name: string;
      keyPrefix: string;
      createdAt: any;
      lastUsedAt?: any | null;
      expiresAt?: any | null;
      member: {
        __typename?: "WorkspaceMember";
        id: string;
        name: string;
        email?: string | null;
      };
    };
  };
};

export type UpdateApiKeyFromApiKeysRouteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateApiKeyInput;
}>;

export type UpdateApiKeyFromApiKeysRouteMutation = {
  __typename?: "Mutation";
  updateApiKey: {
    __typename?: "ApiKey";
    id: string;
    name: string;
    keyPrefix: string;
    createdAt: any;
    lastUsedAt?: any | null;
    expiresAt?: any | null;
    member: {
      __typename?: "WorkspaceMember";
      id: string;
      name: string;
      email?: string | null;
    };
  };
};

export type DeleteApiKeyFromApiKeysRouteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteApiKeyFromApiKeysRouteMutation = {
  __typename?: "Mutation";
  deleteApiKey: {
    __typename?: "ApiKey";
    id: string;
    name: string;
    keyPrefix: string;
    createdAt: any;
    lastUsedAt?: any | null;
    expiresAt?: any | null;
    member: {
      __typename?: "WorkspaceMember";
      id: string;
      name: string;
      email?: string | null;
    };
  };
};

export type GetWorkspacesFromWorkspaceSwitcherQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]["input"]>;
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  query?: InputMaybe<Scalars["String"]["input"]>;
  orderBy?: InputMaybe<WorkspaceOrder>;
}>;

export type GetWorkspacesFromWorkspaceSwitcherQuery = {
  __typename?: "Query";
  workspaces: {
    __typename?: "WorkspaceConnection";
    totalCount: number;
    edges: Array<{
      __typename?: "WorkspaceEdge";
      node: { __typename?: "Workspace"; id: string; name: string };
    }>;
    pageInfo: {
      __typename?: "PageInfo";
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
      endCursor?: string | null;
    };
  };
};

export type GetCurrentUserFromCurrentUserContextQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCurrentUserFromCurrentUserContextQuery = {
  __typename?: "Query";
  currentUser: { __typename?: "User"; id: string; name: string; email: string };
};

export type GetCurrentWorkspaceFromWorkspaceContextQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCurrentWorkspaceFromWorkspaceContextQuery = {
  __typename?: "Query";
  currentWorkspace?: {
    __typename?: "Workspace";
    id: string;
    name: string;
    features: Array<WorkspaceFeature>;
    createdAt: any;
    updatedAt: any;
  } | null;
};

export type GetCurrentWorkspaceMemberFromWorkspaceMemberContextQueryVariables =
  Exact<{ [key: string]: never }>;

export type GetCurrentWorkspaceMemberFromWorkspaceMemberContextQuery = {
  __typename?: "Query";
  currentWorkspaceMember?: {
    __typename?: "WorkspaceMember";
    id: string;
    role: WorkspaceMemberRole;
    name: string;
    email?: string | null;
    permissions: Array<WorkspacePermission>;
    effectivePermissions: Array<WorkspacePermission>;
    inviteToken?: string | null;
    status: WorkspaceMemberStatus;
    inviteExpiresAt?: any | null;
    invitedByUserName?: string | null;
    invitedBy?: { __typename?: "User"; name: string; email: string } | null;
    user?: { __typename?: "User"; email: string } | null;
  } | null;
};

export type GetDomainsFromDomainsRouteQueryVariables = Exact<{
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  filter?: InputMaybe<Scalars["DomainFilter"]["input"]>;
  orderBy?: InputMaybe<DomainOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetDomainsFromDomainsRouteQuery = {
  __typename?: "Query";
  domains: {
    __typename?: "DomainConnection";
    edges: Array<{
      __typename?: "DomainEdge";
      node: {
        __typename?: "Domain";
        id: string;
        name: string;
        status: DomainStatus;
        verificationToken: string;
        verifiedAt?: any | null;
        createdAt: any;
        updatedAt: any;
      };
    }>;
    pageInfo: {
      __typename?: "PageInfo";
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type CreateDomainFromDomainsRouteMutationVariables = Exact<{
  input: CreateDomainInput;
}>;

export type CreateDomainFromDomainsRouteMutation = {
  __typename?: "Mutation";
  createDomain: {
    __typename?: "Domain";
    id: string;
    name: string;
    status: DomainStatus;
    verificationToken: string;
    verifiedAt?: any | null;
    createdAt: any;
    updatedAt: any;
  };
};

export type VerifyDomainFromDomainsRouteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type VerifyDomainFromDomainsRouteMutation = {
  __typename?: "Mutation";
  verifyDomain: {
    __typename?: "Domain";
    id: string;
    name: string;
    status: DomainStatus;
    verificationToken: string;
    verifiedAt?: any | null;
    createdAt: any;
    updatedAt: any;
  };
};

export type DeleteDomainFromDomainsRouteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteDomainFromDomainsRouteMutation = {
  __typename?: "Mutation";
  deleteDomain: {
    __typename?: "Domain";
    id: string;
    name: string;
    status: DomainStatus;
    verificationToken: string;
    verifiedAt?: any | null;
    createdAt: any;
    updatedAt: any;
  };
};

export type GetCurrentWorkspaceFromWorkspaceLayoutQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCurrentWorkspaceFromWorkspaceLayoutQuery = {
  __typename?: "Query";
  currentWorkspace?: { __typename?: "Workspace"; id: string } | null;
  currentWorkspaceMember?: {
    __typename?: "WorkspaceMember";
    id: string;
  } | null;
};

export type GetWorkspaceMemberGroupFromMemberGroupRouteQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
  first?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetWorkspaceMemberGroupFromMemberGroupRouteQuery = {
  __typename?: "Query";
  workspaceMemberGroup: {
    __typename?: "WorkspaceMemberGroup";
    id: string;
    name: string;
    description?: string | null;
    permissions: Array<WorkspacePermission>;
    members: {
      __typename?: "WorkspaceMemberConnection";
      edges: Array<{
        __typename?: "WorkspaceMemberEdge";
        node: {
          __typename?: "WorkspaceMember";
          id: string;
          name: string;
          email?: string | null;
          user?: {
            __typename?: "User";
            id: string;
            name: string;
            email: string;
          } | null;
        };
      }>;
    };
  };
};

export type UpdateWorkspaceMemberGroupFromMemberGroupRouteMutationVariables =
  Exact<{
    id: Scalars["ID"]["input"];
    input: UpdateWorkspaceMemberGroupInput;
  }>;

export type UpdateWorkspaceMemberGroupFromMemberGroupRouteMutation = {
  __typename?: "Mutation";
  updateWorkspaceMemberGroup: {
    __typename?: "WorkspaceMemberGroup";
    id: string;
    name: string;
    description?: string | null;
    permissions: Array<WorkspacePermission>;
  };
};

export type DeleteWorkspaceMemberGroupFromMemberGroupRouteMutationVariables =
  Exact<{
    id: Scalars["ID"]["input"];
  }>;

export type DeleteWorkspaceMemberGroupFromMemberGroupRouteMutation = {
  __typename?: "Mutation";
  deleteWorkspaceMemberGroup: {
    __typename?: "WorkspaceMemberGroup";
    id: string;
  };
};

export type AddMembersToWorkspaceMemberGroupFromMemberGroupRouteMutationVariables =
  Exact<{
    id: Scalars["ID"]["input"];
    memberIds: Array<Scalars["ID"]["input"]> | Scalars["ID"]["input"];
  }>;

export type AddMembersToWorkspaceMemberGroupFromMemberGroupRouteMutation = {
  __typename?: "Mutation";
  addMembersToWorkspaceMemberGroup: {
    __typename?: "WorkspaceMemberGroup";
    id: string;
  };
};

export type RemoveMembersFromWorkspaceMemberGroupFromMemberGroupRouteMutationVariables =
  Exact<{
    id: Scalars["ID"]["input"];
    memberIds: Array<Scalars["ID"]["input"]> | Scalars["ID"]["input"];
  }>;

export type RemoveMembersFromWorkspaceMemberGroupFromMemberGroupRouteMutation =
  {
    __typename?: "Mutation";
    removeMembersFromWorkspaceMemberGroup: {
      __typename?: "WorkspaceMemberGroup";
      id: string;
    };
  };

export type GetWorkspaceMembersFromWorkspaceMemberGroupMembersManagerQueryVariables =
  Exact<{
    after?: InputMaybe<Scalars["String"]["input"]>;
    before?: InputMaybe<Scalars["String"]["input"]>;
    first?: InputMaybe<Scalars["Int"]["input"]>;
    last?: InputMaybe<Scalars["Int"]["input"]>;
    orderBy?: InputMaybe<WorkspaceMemberOrder>;
    query?: InputMaybe<Scalars["String"]["input"]>;
  }>;

export type GetWorkspaceMembersFromWorkspaceMemberGroupMembersManagerQuery = {
  __typename?: "Query";
  workspaceMembers: {
    __typename?: "WorkspaceMemberConnection";
    totalCount: number;
    edges: Array<{
      __typename?: "WorkspaceMemberEdge";
      node: {
        __typename?: "WorkspaceMember";
        id: string;
        name: string;
        email?: string | null;
        status: WorkspaceMemberStatus;
        user?: {
          __typename?: "User";
          id: string;
          name: string;
          email: string;
        } | null;
      };
    }>;
    pageInfo: {
      __typename?: "PageInfo";
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type CreateWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRouteMutationVariables =
  Exact<{
    input: CreateWorkspaceMemberGroupInput;
  }>;

export type CreateWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRouteMutation =
  {
    __typename?: "Mutation";
    createWorkspaceMemberGroup: {
      __typename?: "WorkspaceMemberGroup";
      id: string;
      name: string;
    };
  };

export type GetWorkspaceMemberGroupsFromMemberGroupsRouteQueryVariables =
  Exact<{
    after?: InputMaybe<Scalars["String"]["input"]>;
    before?: InputMaybe<Scalars["String"]["input"]>;
    first?: InputMaybe<Scalars["Int"]["input"]>;
    last?: InputMaybe<Scalars["Int"]["input"]>;
    filter?: InputMaybe<Scalars["WorkspaceMemberGroupFilter"]["input"]>;
    orderBy?: InputMaybe<WorkspaceMemberGroupOrder>;
    query?: InputMaybe<Scalars["String"]["input"]>;
  }>;

export type GetWorkspaceMemberGroupsFromMemberGroupsRouteQuery = {
  __typename?: "Query";
  workspaceMemberGroups: {
    __typename?: "WorkspaceMemberGroupConnection";
    edges: Array<{
      __typename?: "WorkspaceMemberGroupEdge";
      cursor: string;
      node: {
        __typename?: "WorkspaceMemberGroup";
        id: string;
        name: string;
        description?: string | null;
        createdAt: any;
      };
    }>;
    pageInfo: {
      __typename?: "PageInfo";
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type GetCurrentWorkspaceMemberFromMemberRouteQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCurrentWorkspaceMemberFromMemberRouteQuery = {
  __typename?: "Query";
  currentWorkspaceMember?: {
    __typename?: "WorkspaceMember";
    id: string;
    role: WorkspaceMemberRole;
  } | null;
};

export type GetWorkspaceMemberFromMemberRouteQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetWorkspaceMemberFromMemberRouteQuery = {
  __typename?: "Query";
  workspaceMember?: {
    __typename?: "WorkspaceMember";
    id: string;
    name: string;
    email?: string | null;
    role: WorkspaceMemberRole;
    permissions: Array<WorkspacePermission>;
    inviteToken?: string | null;
    status: WorkspaceMemberStatus;
    inviteExpiresAt?: any | null;
    invitedByUserName?: string | null;
    invitedBy?: { __typename?: "User"; name: string; email: string } | null;
    user?: { __typename?: "User"; email: string } | null;
  } | null;
};

export type UpdateWorkspaceMemberFromMemberRouteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateWorkspaceMemberInput;
}>;

export type UpdateWorkspaceMemberFromMemberRouteMutation = {
  __typename?: "Mutation";
  updateWorkspaceMember?: {
    __typename?: "WorkspaceMember";
    id: string;
    name: string;
    email?: string | null;
    role: WorkspaceMemberRole;
    permissions: Array<WorkspacePermission>;
    inviteToken?: string | null;
    status: WorkspaceMemberStatus;
    inviteExpiresAt?: any | null;
    invitedByUserName?: string | null;
    invitedBy?: { __typename?: "User"; name: string; email: string } | null;
    user?: { __typename?: "User"; email: string } | null;
  } | null;
};

export type RemoveWorkspaceMemberFromMemberRouteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type RemoveWorkspaceMemberFromMemberRouteMutation = {
  __typename?: "Mutation";
  removeWorkspaceMember: { __typename?: "WorkspaceMember"; id: string };
};

export type CreateWorkspaceInviteFromInviteMemberDialogMutationVariables =
  Exact<{
    input: CreateWorkspaceInviteInput;
  }>;

export type CreateWorkspaceInviteFromInviteMemberDialogMutation = {
  __typename?: "Mutation";
  createWorkspaceInvite: {
    __typename?: "WorkspaceMember";
    id: string;
    inviteToken?: string | null;
  };
};

export type GetWorkspaceMembersFromMembersRouteQueryVariables = Exact<{
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  filter?: InputMaybe<Scalars["WorkspaceMemberFilter"]["input"]>;
  orderBy?: InputMaybe<WorkspaceMemberOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetWorkspaceMembersFromMembersRouteQuery = {
  __typename?: "Query";
  workspaceMembers: {
    __typename?: "WorkspaceMemberConnection";
    edges: Array<{
      __typename?: "WorkspaceMemberEdge";
      node: {
        __typename?: "WorkspaceMember";
        id: string;
        name: string;
        email?: string | null;
        role: WorkspaceMemberRole;
        status: WorkspaceMemberStatus;
        createdAt: any;
        user?: {
          __typename?: "User";
          id: string;
          name: string;
          email: string;
        } | null;
      };
    }>;
    pageInfo: {
      __typename?: "PageInfo";
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type RemoveWorkspaceMemberFromMembersRouteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type RemoveWorkspaceMemberFromMembersRouteMutation = {
  __typename?: "Mutation";
  removeWorkspaceMember: { __typename?: "WorkspaceMember"; id: string };
};

export type UpdateWorkspaceMemberStatusFromMembersRouteMutationVariables =
  Exact<{
    id: Scalars["ID"]["input"];
    input: UpdateWorkspaceMemberInput;
  }>;

export type UpdateWorkspaceMemberStatusFromMembersRouteMutation = {
  __typename?: "Mutation";
  updateWorkspaceMember?: {
    __typename?: "WorkspaceMember";
    id: string;
    status: WorkspaceMemberStatus;
  } | null;
};

export type GetServicesFromServicesRouteQueryVariables = Exact<{
  projectId: Scalars["ID"]["input"];
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  filter?: InputMaybe<Scalars["ServiceFilter"]["input"]>;
  orderBy?: InputMaybe<ServiceOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetServicesFromServicesRouteQuery = {
  __typename?: "Query";
  project?: { __typename?: "Project"; id: string; name: string } | null;
  services: {
    __typename?: "ServiceConnection";
    edges: Array<{
      __typename?: "ServiceEdge";
      node: {
        __typename?: "Service";
        id: string;
        projectId: string;
        name: string;
        image: string;
        replicas?: number | null;
        status: ServiceStatus;
        createdAt: any;
        ports: Array<{
          __typename?: "ServicePort";
          port: number;
          targetPort?: number | null;
        }>;
        env: Array<{
          __typename?: "ServiceEnvVar";
          key: string;
          value: string;
        }>;
      };
    }>;
    pageInfo: {
      __typename?: "PageInfo";
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type CreateServiceFromServicesRouteMutationVariables = Exact<{
  input: CreateServiceInput;
}>;

export type CreateServiceFromServicesRouteMutation = {
  __typename?: "Mutation";
  createService: {
    __typename?: "Service";
    id: string;
    projectId: string;
    name: string;
    image: string;
    replicas?: number | null;
    command: Array<string>;
    args: Array<string>;
    status: ServiceStatus;
    createdAt: any;
    resources?: {
      __typename?: "ServiceResources";
      cpuRequest?: string | null;
      cpuLimit?: string | null;
      memoryRequest?: string | null;
      memoryLimit?: string | null;
    } | null;
    healthCheck?: {
      __typename?: "ServiceHealthCheck";
      type: ServiceHealthCheckType;
      port: number;
      path?: string | null;
    } | null;
    ports: Array<{
      __typename?: "ServicePort";
      port: number;
      targetPort?: number | null;
    }>;
    env: Array<{ __typename?: "ServiceEnvVar"; key: string; value: string }>;
  };
};

export type DeleteServiceFromServicesRouteMutationVariables = Exact<{
  projectId: Scalars["ID"]["input"];
  id: Scalars["ID"]["input"];
}>;

export type DeleteServiceFromServicesRouteMutation = {
  __typename?: "Mutation";
  deleteService: { __typename?: "Service"; id: string };
};

export type UpdateProjectFromProjectRouteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateProjectInput;
}>;

export type UpdateProjectFromProjectRouteMutation = {
  __typename?: "Mutation";
  updateProject: {
    __typename?: "Project";
    id: string;
    name: string;
    status: ProjectStatus;
    updatedAt: any;
  };
};

export type DeleteProjectFromProjectRouteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteProjectFromProjectRouteMutation = {
  __typename?: "Mutation";
  deleteProject: { __typename?: "Project"; id: string };
};

export type GetProjectFromProjectLayoutQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetProjectFromProjectLayoutQuery = {
  __typename?: "Query";
  project?: {
    __typename?: "Project";
    id: string;
    name: string;
    status: ProjectStatus;
    createdAt: any;
    updatedAt: any;
  } | null;
};

export type GetServiceDeploymentsFromServiceDeploymentsRouteQueryVariables =
  Exact<{
    projectId: Scalars["ID"]["input"];
    serviceId: Scalars["ID"]["input"];
    first?: InputMaybe<Scalars["Int"]["input"]>;
    orderBy?: InputMaybe<DeploymentOrder>;
  }>;

export type GetServiceDeploymentsFromServiceDeploymentsRouteQuery = {
  __typename?: "Query";
  deployments: {
    __typename?: "DeploymentConnection";
    totalCount: number;
    edges: Array<{
      __typename?: "DeploymentEdge";
      node: {
        __typename?: "Deployment";
        id: string;
        projectId: string;
        serviceId: string;
        version: number;
        image: string;
        replicas?: number | null;
        status: DeploymentStatus;
        active: boolean;
        latest: boolean;
        kubernetesDeploymentName?: string | null;
        createdAt: any;
        updatedAt: any;
      };
    }>;
    pageInfo: { __typename?: "PageInfo"; hasNextPage: boolean };
  };
};

export type UpdateServiceEnvironmentFromServiceEnvironmentRouteMutationVariables =
  Exact<{
    projectId: Scalars["ID"]["input"];
    id: Scalars["ID"]["input"];
    input: UpdateServiceInput;
  }>;

export type UpdateServiceEnvironmentFromServiceEnvironmentRouteMutation = {
  __typename?: "Mutation";
  updateService: {
    __typename?: "Service";
    id: string;
    updatedAt: any;
    env: Array<{ __typename?: "ServiceEnvVar"; key: string; value: string }>;
  };
};

export type GetServiceLogsFromServiceLogsRouteQueryVariables = Exact<{
  projectId: Scalars["ID"]["input"];
  id: Scalars["ID"]["input"];
  rangeSeconds?: InputMaybe<Scalars["Int"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetServiceLogsFromServiceLogsRouteQuery = {
  __typename?: "Query";
  service?: {
    __typename?: "Service";
    id: string;
    logs: {
      __typename?: "ServiceLogs";
      available: boolean;
      rangeSeconds: number;
      limit: number;
      entries: Array<{
        __typename?: "ServiceLogEntry";
        timestamp: any;
        message: string;
        namespace?: string | null;
        podName?: string | null;
        containerName?: string | null;
        deploymentName?: string | null;
      }>;
    };
  } | null;
};

export type GetServiceMetricsFromServiceMetricsRouteQueryVariables = Exact<{
  projectId: Scalars["ID"]["input"];
  id: Scalars["ID"]["input"];
  rangeSeconds?: InputMaybe<Scalars["Int"]["input"]>;
  stepSeconds?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetServiceMetricsFromServiceMetricsRouteQuery = {
  __typename?: "Query";
  service?: {
    __typename?: "Service";
    id: string;
    metrics: {
      __typename?: "ServiceMetrics";
      available: boolean;
      rangeSeconds: number;
      stepSeconds: number;
      cpuLimitMillicores?: number | null;
      memoryLimitBytes?: number | null;
      cpuUsageMillicores: Array<{
        __typename?: "KubernetesMetricPoint";
        timestamp: any;
        value: number;
      }>;
      memoryUsageBytes: Array<{
        __typename?: "KubernetesMetricPoint";
        timestamp: any;
        value: number;
      }>;
      networkReceiveBytesPerSecond: Array<{
        __typename?: "KubernetesMetricPoint";
        timestamp: any;
        value: number;
      }>;
      networkTransmitBytesPerSecond: Array<{
        __typename?: "KubernetesMetricPoint";
        timestamp: any;
        value: number;
      }>;
    };
  } | null;
};

export type UpdateServiceNetworkFromServiceNetworkRouteMutationVariables =
  Exact<{
    projectId: Scalars["ID"]["input"];
    id: Scalars["ID"]["input"];
    input: UpdateServiceInput;
  }>;

export type UpdateServiceNetworkFromServiceNetworkRouteMutation = {
  __typename?: "Mutation";
  updateService: {
    __typename?: "Service";
    id: string;
    updatedAt: any;
    ports: Array<{
      __typename?: "ServicePort";
      port: number;
      targetPort?: number | null;
    }>;
    healthCheck?: {
      __typename?: "ServiceHealthCheck";
      type: ServiceHealthCheckType;
      port: number;
      path?: string | null;
    } | null;
  };
};

export type UpdateServiceSettingsFromServiceSettingsRouteMutationVariables =
  Exact<{
    projectId: Scalars["ID"]["input"];
    id: Scalars["ID"]["input"];
    input: UpdateServiceInput;
  }>;

export type UpdateServiceSettingsFromServiceSettingsRouteMutation = {
  __typename?: "Mutation";
  updateService: {
    __typename?: "Service";
    id: string;
    name: string;
    replicas?: number | null;
    updatedAt: any;
    resources?: {
      __typename?: "ServiceResources";
      cpuRequest?: string | null;
      cpuLimit?: string | null;
      memoryRequest?: string | null;
      memoryLimit?: string | null;
    } | null;
  };
};

export type DeleteServiceFromServiceSettingsRouteMutationVariables = Exact<{
  projectId: Scalars["ID"]["input"];
  id: Scalars["ID"]["input"];
}>;

export type DeleteServiceFromServiceSettingsRouteMutation = {
  __typename?: "Mutation";
  deleteService: { __typename?: "Service"; id: string };
};

export type UpdateServiceSourceFromServiceSourceRouteMutationVariables = Exact<{
  projectId: Scalars["ID"]["input"];
  id: Scalars["ID"]["input"];
  input: UpdateServiceInput;
}>;

export type UpdateServiceSourceFromServiceSourceRouteMutation = {
  __typename?: "Mutation";
  updateService: {
    __typename?: "Service";
    id: string;
    image: string;
    command: Array<string>;
    args: Array<string>;
    updatedAt: any;
  };
};

export type GetDeploymentFromDeploymentLayoutQueryVariables = Exact<{
  projectId: Scalars["ID"]["input"];
  id: Scalars["ID"]["input"];
}>;

export type GetDeploymentFromDeploymentLayoutQuery = {
  __typename?: "Query";
  deployment?: {
    __typename?: "Deployment";
    id: string;
    projectId: string;
    serviceId: string;
    version: number;
    image: string;
    replicas?: number | null;
    command: Array<string>;
    args: Array<string>;
    serviceAccountName?: string | null;
    status: DeploymentStatus;
    active: boolean;
    latest: boolean;
    kubernetesDeploymentName?: string | null;
    createdAt: any;
    updatedAt: any;
    ports: Array<{
      __typename?: "DeploymentPort";
      port: number;
      targetPort?: number | null;
    }>;
    env: Array<{
      __typename?: "DeploymentEnvVar";
      name: string;
      value?: string | null;
    }>;
    envFrom: Array<{
      __typename?: "DeploymentEnvFrom";
      kind: string;
      name: string;
      prefix?: string | null;
    }>;
    resources?: {
      __typename?: "DeploymentResources";
      cpuRequest?: string | null;
      cpuLimit?: string | null;
      memoryRequest?: string | null;
      memoryLimit?: string | null;
    } | null;
  } | null;
};

export type GetServiceFromServiceLayoutQueryVariables = Exact<{
  projectId: Scalars["ID"]["input"];
  id: Scalars["ID"]["input"];
}>;

export type GetServiceFromServiceLayoutQuery = {
  __typename?: "Query";
  service?: {
    __typename?: "Service";
    id: string;
    projectId: string;
    name: string;
    image: string;
    replicas?: number | null;
    command: Array<string>;
    args: Array<string>;
    status: ServiceStatus;
    createdAt: any;
    updatedAt: any;
    resources?: {
      __typename?: "ServiceResources";
      cpuRequest?: string | null;
      cpuLimit?: string | null;
      memoryRequest?: string | null;
      memoryLimit?: string | null;
    } | null;
    healthCheck?: {
      __typename?: "ServiceHealthCheck";
      type: ServiceHealthCheckType;
      port: number;
      path?: string | null;
    } | null;
    ports: Array<{
      __typename?: "ServicePort";
      port: number;
      targetPort?: number | null;
    }>;
    env: Array<{ __typename?: "ServiceEnvVar"; key: string; value: string }>;
  } | null;
};

export type GetProjectsFromProjectsRouteQueryVariables = Exact<{
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  filter?: InputMaybe<Scalars["ProjectFilter"]["input"]>;
  orderBy?: InputMaybe<ProjectOrder>;
  query?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetProjectsFromProjectsRouteQuery = {
  __typename?: "Query";
  projects: {
    __typename?: "ProjectConnection";
    edges: Array<{
      __typename?: "ProjectEdge";
      node: {
        __typename?: "Project";
        id: string;
        name: string;
        status: ProjectStatus;
        createdAt: any;
        updatedAt: any;
      };
    }>;
    pageInfo: {
      __typename?: "PageInfo";
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type CreateProjectFromProjectsRouteMutationVariables = Exact<{
  input: CreateProjectInput;
}>;

export type CreateProjectFromProjectsRouteMutation = {
  __typename?: "Mutation";
  createProject: {
    __typename?: "Project";
    id: string;
    name: string;
    status: ProjectStatus;
    createdAt: any;
    updatedAt: any;
  };
};

export type DeleteProjectFromProjectsRouteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteProjectFromProjectsRouteMutation = {
  __typename?: "Mutation";
  deleteProject: { __typename?: "Project"; id: string };
};

export type UpdateWorkspaceFromSettingsRouteMutationVariables = Exact<{
  input: UpdateWorkspaceInput;
}>;

export type UpdateWorkspaceFromSettingsRouteMutation = {
  __typename?: "Mutation";
  updateWorkspace: { __typename?: "Workspace"; id: string; name: string };
};

export type DeleteWorkspaceFromSettingsRouteMutationVariables = Exact<{
  [key: string]: never;
}>;

export type DeleteWorkspaceFromSettingsRouteMutation = {
  __typename?: "Mutation";
  deleteWorkspace: { __typename?: "Workspace"; id: string };
};

export type CreateWorkspaceFromCreateWorkspaceFormMutationVariables = Exact<{
  input: CreateWorkspaceInput;
}>;

export type CreateWorkspaceFromCreateWorkspaceFormMutation = {
  __typename?: "Mutation";
  createWorkspace: { __typename?: "Workspace"; id: string };
};

export type CreateWorkspaceFromCreateWorkspaceRouteMutationVariables = Exact<{
  input: CreateWorkspaceInput;
}>;

export type CreateWorkspaceFromCreateWorkspaceRouteMutation = {
  __typename?: "Mutation";
  createWorkspace: { __typename?: "Workspace"; id: string };
};

export type GetFirstWorkspaceFromWorkspacesRouteQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetFirstWorkspaceFromWorkspacesRouteQuery = {
  __typename?: "Query";
  workspaces: {
    __typename?: "WorkspaceConnection";
    edges: Array<{
      __typename?: "WorkspaceEdge";
      node: { __typename?: "Workspace"; id: string };
    }>;
  };
};

export type GetCurrentUserFromAuthLayoutQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCurrentUserFromAuthLayoutQuery = {
  __typename?: "Query";
  currentUser: { __typename?: "User"; id: string };
};

export type GetCurrentUserFromInviteRouteQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCurrentUserFromInviteRouteQuery = {
  __typename?: "Query";
  currentUser: { __typename?: "User"; id: string; name: string; email: string };
};

export type GetWorkspaceMemberByTokenFromInviteRouteQueryVariables = Exact<{
  token: Scalars["String"]["input"];
}>;

export type GetWorkspaceMemberByTokenFromInviteRouteQuery = {
  __typename?: "Query";
  workspaceMemberByToken?: {
    __typename?: "WorkspaceMember";
    id: string;
    name: string;
    email?: string | null;
    role: WorkspaceMemberRole;
    status: WorkspaceMemberStatus;
    inviteExpiresAt?: any | null;
  } | null;
};

export type AcceptWorkspaceInviteFromInviteRouteMutationVariables = Exact<{
  token: Scalars["String"]["input"];
  input?: InputMaybe<AcceptWorkspaceInviteInput>;
}>;

export type AcceptWorkspaceInviteFromInviteRouteMutation = {
  __typename?: "Mutation";
  acceptWorkspaceInvite: {
    __typename?: "AcceptWorkspaceInviteResult";
    workspaceId: string;
    workspaceMember: {
      __typename?: "WorkspaceMember";
      id: string;
      name: string;
      role: WorkspaceMemberRole;
    };
  };
};

export const GetCurrentUserFromAuthenticatedRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getCurrentUserFromAuthenticatedRoute" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "currentUser" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCurrentUserFromAuthenticatedRouteQuery,
  GetCurrentUserFromAuthenticatedRouteQueryVariables
>;
export const GetApiKeysFromApiKeysRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getApiKeysFromApiKeysRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "after" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "before" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "last" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filter" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ApiKeyFilter" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "orderBy" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ApiKeyOrder" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "query" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "apiKeys" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "after" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "before" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "before" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "first" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "last" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "last" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "orderBy" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "filter" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "filter" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "query" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "keyPrefix" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "lastUsedAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "expiresAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "member" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "name" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "email" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endCursor" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startCursor" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetApiKeysFromApiKeysRouteQuery,
  GetApiKeysFromApiKeysRouteQueryVariables
>;
export const CreateApiKeyFromApiKeysRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createApiKeyFromApiKeysRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateApiKeyInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createApiKey" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "apiKey" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "entity" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "keyPrefix" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lastUsedAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "expiresAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "member" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "email" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateApiKeyFromApiKeysRouteMutation,
  CreateApiKeyFromApiKeysRouteMutationVariables
>;
export const UpdateApiKeyFromApiKeysRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "updateApiKeyFromApiKeysRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateApiKeyInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateApiKey" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "keyPrefix" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "lastUsedAt" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "member" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateApiKeyFromApiKeysRouteMutation,
  UpdateApiKeyFromApiKeysRouteMutationVariables
>;
export const DeleteApiKeyFromApiKeysRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "deleteApiKeyFromApiKeysRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteApiKey" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "keyPrefix" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "lastUsedAt" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "member" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteApiKeyFromApiKeysRouteMutation,
  DeleteApiKeyFromApiKeysRouteMutationVariables
>;
export const GetWorkspacesFromWorkspaceSwitcherDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getWorkspacesFromWorkspaceSwitcher" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "after" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "before" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "query" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "orderBy" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "WorkspaceOrder" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workspaces" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "first" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "after" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "before" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "before" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "query" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "orderBy" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startCursor" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endCursor" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "totalCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetWorkspacesFromWorkspaceSwitcherQuery,
  GetWorkspacesFromWorkspaceSwitcherQueryVariables
>;
export const GetCurrentUserFromCurrentUserContextDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getCurrentUserFromCurrentUserContext" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "currentUser" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCurrentUserFromCurrentUserContextQuery,
  GetCurrentUserFromCurrentUserContextQueryVariables
>;
export const GetCurrentWorkspaceFromWorkspaceContextDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getCurrentWorkspaceFromWorkspaceContext" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "currentWorkspace" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "features" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCurrentWorkspaceFromWorkspaceContextQuery,
  GetCurrentWorkspaceFromWorkspaceContextQueryVariables
>;
export const GetCurrentWorkspaceMemberFromWorkspaceMemberContextDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: {
        kind: "Name",
        value: "getCurrentWorkspaceMemberFromWorkspaceMemberContext",
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "currentWorkspaceMember" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "permissions" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "effectivePermissions" },
                },
                { kind: "Field", name: { kind: "Name", value: "inviteToken" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "inviteExpiresAt" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "invitedBy" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "invitedByUserName" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCurrentWorkspaceMemberFromWorkspaceMemberContextQuery,
  GetCurrentWorkspaceMemberFromWorkspaceMemberContextQueryVariables
>;
export const GetDomainsFromDomainsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getDomainsFromDomainsRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "after" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "before" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "last" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filter" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "DomainFilter" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "orderBy" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "DomainOrder" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "query" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "domains" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "after" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "before" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "before" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "first" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "last" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "last" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "orderBy" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "filter" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "filter" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "query" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "verificationToken",
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "verifiedAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "updatedAt" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endCursor" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startCursor" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetDomainsFromDomainsRouteQuery,
  GetDomainsFromDomainsRouteQueryVariables
>;
export const CreateDomainFromDomainsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createDomainFromDomainsRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateDomainInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createDomain" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "verificationToken" },
                },
                { kind: "Field", name: { kind: "Name", value: "verifiedAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateDomainFromDomainsRouteMutation,
  CreateDomainFromDomainsRouteMutationVariables
>;
export const VerifyDomainFromDomainsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "verifyDomainFromDomainsRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "verifyDomain" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "verificationToken" },
                },
                { kind: "Field", name: { kind: "Name", value: "verifiedAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  VerifyDomainFromDomainsRouteMutation,
  VerifyDomainFromDomainsRouteMutationVariables
>;
export const DeleteDomainFromDomainsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "deleteDomainFromDomainsRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteDomain" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "verificationToken" },
                },
                { kind: "Field", name: { kind: "Name", value: "verifiedAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteDomainFromDomainsRouteMutation,
  DeleteDomainFromDomainsRouteMutationVariables
>;
export const GetCurrentWorkspaceFromWorkspaceLayoutDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getCurrentWorkspaceFromWorkspaceLayout" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "currentWorkspace" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "currentWorkspaceMember" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCurrentWorkspaceFromWorkspaceLayoutQuery,
  GetCurrentWorkspaceFromWorkspaceLayoutQueryVariables
>;
export const GetWorkspaceMemberGroupFromMemberGroupRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: {
        kind: "Name",
        value: "getWorkspaceMemberGroupFromMemberGroupRoute",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workspaceMemberGroup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "permissions" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "members" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "first" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "edges" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "node" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "name" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "email" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "user" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "id" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "name" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "email",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetWorkspaceMemberGroupFromMemberGroupRouteQuery,
  GetWorkspaceMemberGroupFromMemberGroupRouteQueryVariables
>;
export const UpdateWorkspaceMemberGroupFromMemberGroupRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: {
        kind: "Name",
        value: "updateWorkspaceMemberGroupFromMemberGroupRoute",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateWorkspaceMemberGroupInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateWorkspaceMemberGroup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "permissions" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateWorkspaceMemberGroupFromMemberGroupRouteMutation,
  UpdateWorkspaceMemberGroupFromMemberGroupRouteMutationVariables
>;
export const DeleteWorkspaceMemberGroupFromMemberGroupRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: {
        kind: "Name",
        value: "deleteWorkspaceMemberGroupFromMemberGroupRoute",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteWorkspaceMemberGroup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteWorkspaceMemberGroupFromMemberGroupRouteMutation,
  DeleteWorkspaceMemberGroupFromMemberGroupRouteMutationVariables
>;
export const AddMembersToWorkspaceMemberGroupFromMemberGroupRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: {
        kind: "Name",
        value: "addMembersToWorkspaceMemberGroupFromMemberGroupRoute",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "memberIds" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "ID" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addMembersToWorkspaceMemberGroup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "memberIds" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "memberIds" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AddMembersToWorkspaceMemberGroupFromMemberGroupRouteMutation,
  AddMembersToWorkspaceMemberGroupFromMemberGroupRouteMutationVariables
>;
export const RemoveMembersFromWorkspaceMemberGroupFromMemberGroupRouteDocument =
  {
    kind: "Document",
    definitions: [
      {
        kind: "OperationDefinition",
        operation: "mutation",
        name: {
          kind: "Name",
          value: "removeMembersFromWorkspaceMemberGroupFromMemberGroupRoute",
        },
        variableDefinitions: [
          {
            kind: "VariableDefinition",
            variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
            },
          },
          {
            kind: "VariableDefinition",
            variable: {
              kind: "Variable",
              name: { kind: "Name", value: "memberIds" },
            },
            type: {
              kind: "NonNullType",
              type: {
                kind: "ListType",
                type: {
                  kind: "NonNullType",
                  type: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "ID" },
                  },
                },
              },
            },
          },
        ],
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "Field",
              name: {
                kind: "Name",
                value: "removeMembersFromWorkspaceMemberGroup",
              },
              arguments: [
                {
                  kind: "Argument",
                  name: { kind: "Name", value: "id" },
                  value: {
                    kind: "Variable",
                    name: { kind: "Name", value: "id" },
                  },
                },
                {
                  kind: "Argument",
                  name: { kind: "Name", value: "memberIds" },
                  value: {
                    kind: "Variable",
                    name: { kind: "Name", value: "memberIds" },
                  },
                },
              ],
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  { kind: "Field", name: { kind: "Name", value: "id" } },
                ],
              },
            },
          ],
        },
      },
    ],
  } as unknown as DocumentNode<
    RemoveMembersFromWorkspaceMemberGroupFromMemberGroupRouteMutation,
    RemoveMembersFromWorkspaceMemberGroupFromMemberGroupRouteMutationVariables
  >;
export const GetWorkspaceMembersFromWorkspaceMemberGroupMembersManagerDocument =
  {
    kind: "Document",
    definitions: [
      {
        kind: "OperationDefinition",
        operation: "query",
        name: {
          kind: "Name",
          value: "getWorkspaceMembersFromWorkspaceMemberGroupMembersManager",
        },
        variableDefinitions: [
          {
            kind: "VariableDefinition",
            variable: {
              kind: "Variable",
              name: { kind: "Name", value: "after" },
            },
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
          {
            kind: "VariableDefinition",
            variable: {
              kind: "Variable",
              name: { kind: "Name", value: "before" },
            },
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
          {
            kind: "VariableDefinition",
            variable: {
              kind: "Variable",
              name: { kind: "Name", value: "first" },
            },
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
          {
            kind: "VariableDefinition",
            variable: {
              kind: "Variable",
              name: { kind: "Name", value: "last" },
            },
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
          {
            kind: "VariableDefinition",
            variable: {
              kind: "Variable",
              name: { kind: "Name", value: "orderBy" },
            },
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "WorkspaceMemberOrder" },
            },
          },
          {
            kind: "VariableDefinition",
            variable: {
              kind: "Variable",
              name: { kind: "Name", value: "query" },
            },
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        ],
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "Field",
              name: { kind: "Name", value: "workspaceMembers" },
              arguments: [
                {
                  kind: "Argument",
                  name: { kind: "Name", value: "after" },
                  value: {
                    kind: "Variable",
                    name: { kind: "Name", value: "after" },
                  },
                },
                {
                  kind: "Argument",
                  name: { kind: "Name", value: "before" },
                  value: {
                    kind: "Variable",
                    name: { kind: "Name", value: "before" },
                  },
                },
                {
                  kind: "Argument",
                  name: { kind: "Name", value: "first" },
                  value: {
                    kind: "Variable",
                    name: { kind: "Name", value: "first" },
                  },
                },
                {
                  kind: "Argument",
                  name: { kind: "Name", value: "last" },
                  value: {
                    kind: "Variable",
                    name: { kind: "Name", value: "last" },
                  },
                },
                {
                  kind: "Argument",
                  name: { kind: "Name", value: "orderBy" },
                  value: {
                    kind: "Variable",
                    name: { kind: "Name", value: "orderBy" },
                  },
                },
                {
                  kind: "Argument",
                  name: { kind: "Name", value: "query" },
                  value: {
                    kind: "Variable",
                    name: { kind: "Name", value: "query" },
                  },
                },
              ],
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "edges" },
                    selectionSet: {
                      kind: "SelectionSet",
                      selections: [
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "node" },
                          selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                              {
                                kind: "Field",
                                name: { kind: "Name", value: "id" },
                              },
                              {
                                kind: "Field",
                                name: { kind: "Name", value: "name" },
                              },
                              {
                                kind: "Field",
                                name: { kind: "Name", value: "email" },
                              },
                              {
                                kind: "Field",
                                name: { kind: "Name", value: "status" },
                              },
                              {
                                kind: "Field",
                                name: { kind: "Name", value: "user" },
                                selectionSet: {
                                  kind: "SelectionSet",
                                  selections: [
                                    {
                                      kind: "Field",
                                      name: { kind: "Name", value: "id" },
                                    },
                                    {
                                      kind: "Field",
                                      name: { kind: "Name", value: "name" },
                                    },
                                    {
                                      kind: "Field",
                                      name: { kind: "Name", value: "email" },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "pageInfo" },
                    selectionSet: {
                      kind: "SelectionSet",
                      selections: [
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "endCursor" },
                        },
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "hasNextPage" },
                        },
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "hasPreviousPage" },
                        },
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "startCursor" },
                        },
                      ],
                    },
                  },
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "totalCount" },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  } as unknown as DocumentNode<
    GetWorkspaceMembersFromWorkspaceMemberGroupMembersManagerQuery,
    GetWorkspaceMembersFromWorkspaceMemberGroupMembersManagerQueryVariables
  >;
export const CreateWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRouteDocument =
  {
    kind: "Document",
    definitions: [
      {
        kind: "OperationDefinition",
        operation: "mutation",
        name: {
          kind: "Name",
          value:
            "createWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRoute",
        },
        variableDefinitions: [
          {
            kind: "VariableDefinition",
            variable: {
              kind: "Variable",
              name: { kind: "Name", value: "input" },
            },
            type: {
              kind: "NonNullType",
              type: {
                kind: "NamedType",
                name: {
                  kind: "Name",
                  value: "CreateWorkspaceMemberGroupInput",
                },
              },
            },
          },
        ],
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "Field",
              name: { kind: "Name", value: "createWorkspaceMemberGroup" },
              arguments: [
                {
                  kind: "Argument",
                  name: { kind: "Name", value: "input" },
                  value: {
                    kind: "Variable",
                    name: { kind: "Name", value: "input" },
                  },
                },
              ],
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  { kind: "Field", name: { kind: "Name", value: "id" } },
                  { kind: "Field", name: { kind: "Name", value: "name" } },
                ],
              },
            },
          ],
        },
      },
    ],
  } as unknown as DocumentNode<
    CreateWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRouteMutation,
    CreateWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRouteMutationVariables
  >;
export const GetWorkspaceMemberGroupsFromMemberGroupsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: {
        kind: "Name",
        value: "getWorkspaceMemberGroupsFromMemberGroupsRoute",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "after" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "before" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "last" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filter" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "WorkspaceMemberGroupFilter" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "orderBy" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "WorkspaceMemberGroupOrder" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "query" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workspaceMemberGroups" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "after" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "before" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "before" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "first" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "last" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "last" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "filter" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "filter" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "orderBy" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "query" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "description" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cursor" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endCursor" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startCursor" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetWorkspaceMemberGroupsFromMemberGroupsRouteQuery,
  GetWorkspaceMemberGroupsFromMemberGroupsRouteQueryVariables
>;
export const GetCurrentWorkspaceMemberFromMemberRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getCurrentWorkspaceMemberFromMemberRoute" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "currentWorkspaceMember" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCurrentWorkspaceMemberFromMemberRouteQuery,
  GetCurrentWorkspaceMemberFromMemberRouteQueryVariables
>;
export const GetWorkspaceMemberFromMemberRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getWorkspaceMemberFromMemberRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workspaceMember" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "permissions" } },
                { kind: "Field", name: { kind: "Name", value: "inviteToken" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "inviteExpiresAt" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "invitedBy" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "invitedByUserName" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetWorkspaceMemberFromMemberRouteQuery,
  GetWorkspaceMemberFromMemberRouteQueryVariables
>;
export const UpdateWorkspaceMemberFromMemberRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "updateWorkspaceMemberFromMemberRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateWorkspaceMemberInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateWorkspaceMember" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "permissions" } },
                { kind: "Field", name: { kind: "Name", value: "inviteToken" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "inviteExpiresAt" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "invitedBy" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "invitedByUserName" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateWorkspaceMemberFromMemberRouteMutation,
  UpdateWorkspaceMemberFromMemberRouteMutationVariables
>;
export const RemoveWorkspaceMemberFromMemberRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "removeWorkspaceMemberFromMemberRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removeWorkspaceMember" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveWorkspaceMemberFromMemberRouteMutation,
  RemoveWorkspaceMemberFromMemberRouteMutationVariables
>;
export const CreateWorkspaceInviteFromInviteMemberDialogDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: {
        kind: "Name",
        value: "createWorkspaceInviteFromInviteMemberDialog",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateWorkspaceInviteInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createWorkspaceInvite" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "inviteToken" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateWorkspaceInviteFromInviteMemberDialogMutation,
  CreateWorkspaceInviteFromInviteMemberDialogMutationVariables
>;
export const GetWorkspaceMembersFromMembersRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getWorkspaceMembersFromMembersRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "after" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "before" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "last" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filter" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "WorkspaceMemberFilter" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "orderBy" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "WorkspaceMemberOrder" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "query" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workspaceMembers" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "after" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "before" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "before" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "first" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "last" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "last" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "orderBy" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "filter" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "filter" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "query" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "email" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "role" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "name" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "email" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endCursor" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startCursor" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetWorkspaceMembersFromMembersRouteQuery,
  GetWorkspaceMembersFromMembersRouteQueryVariables
>;
export const RemoveWorkspaceMemberFromMembersRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "removeWorkspaceMemberFromMembersRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removeWorkspaceMember" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveWorkspaceMemberFromMembersRouteMutation,
  RemoveWorkspaceMemberFromMembersRouteMutationVariables
>;
export const UpdateWorkspaceMemberStatusFromMembersRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: {
        kind: "Name",
        value: "updateWorkspaceMemberStatusFromMembersRoute",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateWorkspaceMemberInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateWorkspaceMember" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateWorkspaceMemberStatusFromMembersRouteMutation,
  UpdateWorkspaceMemberStatusFromMembersRouteMutationVariables
>;
export const GetServicesFromServicesRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getServicesFromServicesRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "after" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "before" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "last" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filter" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ServiceFilter" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "orderBy" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ServiceOrder" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "query" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "project" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "services" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "after" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "before" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "before" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "first" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "last" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "last" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "filter" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "filter" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "orderBy" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "query" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "projectId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "image" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "replicas" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "ports" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "port" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "targetPort" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "env" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "key" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "value" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endCursor" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startCursor" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetServicesFromServicesRouteQuery,
  GetServicesFromServicesRouteQueryVariables
>;
export const CreateServiceFromServicesRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createServiceFromServicesRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateServiceInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createService" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "projectId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "image" } },
                { kind: "Field", name: { kind: "Name", value: "replicas" } },
                { kind: "Field", name: { kind: "Name", value: "command" } },
                { kind: "Field", name: { kind: "Name", value: "args" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "resources" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cpuRequest" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cpuLimit" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "memoryRequest" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "memoryLimit" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "healthCheck" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "port" } },
                      { kind: "Field", name: { kind: "Name", value: "path" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "ports" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "port" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetPort" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "env" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "value" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateServiceFromServicesRouteMutation,
  CreateServiceFromServicesRouteMutationVariables
>;
export const DeleteServiceFromServicesRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "deleteServiceFromServicesRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteService" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteServiceFromServicesRouteMutation,
  DeleteServiceFromServicesRouteMutationVariables
>;
export const UpdateProjectFromProjectRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "updateProjectFromProjectRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateProjectInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateProject" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateProjectFromProjectRouteMutation,
  UpdateProjectFromProjectRouteMutationVariables
>;
export const DeleteProjectFromProjectRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "deleteProjectFromProjectRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteProject" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteProjectFromProjectRouteMutation,
  DeleteProjectFromProjectRouteMutationVariables
>;
export const GetProjectFromProjectLayoutDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getProjectFromProjectLayout" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "project" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetProjectFromProjectLayoutQuery,
  GetProjectFromProjectLayoutQueryVariables
>;
export const GetServiceDeploymentsFromServiceDeploymentsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: {
        kind: "Name",
        value: "getServiceDeploymentsFromServiceDeploymentsRoute",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "serviceId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "orderBy" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "DeploymentOrder" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deployments" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "serviceId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "serviceId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "first" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "orderBy" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "projectId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "serviceId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "version" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "image" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "replicas" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "active" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "latest" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "kubernetesDeploymentName",
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "updatedAt" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetServiceDeploymentsFromServiceDeploymentsRouteQuery,
  GetServiceDeploymentsFromServiceDeploymentsRouteQueryVariables
>;
export const UpdateServiceEnvironmentFromServiceEnvironmentRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: {
        kind: "Name",
        value: "updateServiceEnvironmentFromServiceEnvironmentRoute",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateServiceInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateService" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "env" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "value" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateServiceEnvironmentFromServiceEnvironmentRouteMutation,
  UpdateServiceEnvironmentFromServiceEnvironmentRouteMutationVariables
>;
export const GetServiceLogsFromServiceLogsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getServiceLogsFromServiceLogsRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "rangeSeconds" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "limit" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "service" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "logs" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "rangeSeconds" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "rangeSeconds" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "limit" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "limit" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "available" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "rangeSeconds" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "limit" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "entries" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "timestamp" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "message" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "namespace" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "podName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "containerName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "deploymentName" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetServiceLogsFromServiceLogsRouteQuery,
  GetServiceLogsFromServiceLogsRouteQueryVariables
>;
export const GetServiceMetricsFromServiceMetricsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getServiceMetricsFromServiceMetricsRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "rangeSeconds" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "stepSeconds" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "service" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "metrics" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "rangeSeconds" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "rangeSeconds" },
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "stepSeconds" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "stepSeconds" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "available" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "rangeSeconds" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "stepSeconds" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cpuLimitMillicores" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "memoryLimitBytes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cpuUsageMillicores" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "timestamp" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "value" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "memoryUsageBytes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "timestamp" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "value" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "networkReceiveBytesPerSecond",
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "timestamp" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "value" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "networkTransmitBytesPerSecond",
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "timestamp" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "value" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetServiceMetricsFromServiceMetricsRouteQuery,
  GetServiceMetricsFromServiceMetricsRouteQueryVariables
>;
export const UpdateServiceNetworkFromServiceNetworkRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: {
        kind: "Name",
        value: "updateServiceNetworkFromServiceNetworkRoute",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateServiceInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateService" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "ports" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "port" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetPort" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "healthCheck" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "port" } },
                      { kind: "Field", name: { kind: "Name", value: "path" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateServiceNetworkFromServiceNetworkRouteMutation,
  UpdateServiceNetworkFromServiceNetworkRouteMutationVariables
>;
export const UpdateServiceSettingsFromServiceSettingsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: {
        kind: "Name",
        value: "updateServiceSettingsFromServiceSettingsRoute",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateServiceInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateService" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "replicas" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "resources" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cpuRequest" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cpuLimit" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "memoryRequest" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "memoryLimit" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateServiceSettingsFromServiceSettingsRouteMutation,
  UpdateServiceSettingsFromServiceSettingsRouteMutationVariables
>;
export const DeleteServiceFromServiceSettingsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "deleteServiceFromServiceSettingsRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteService" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteServiceFromServiceSettingsRouteMutation,
  DeleteServiceFromServiceSettingsRouteMutationVariables
>;
export const UpdateServiceSourceFromServiceSourceRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: {
        kind: "Name",
        value: "updateServiceSourceFromServiceSourceRoute",
      },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateServiceInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateService" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "image" } },
                { kind: "Field", name: { kind: "Name", value: "command" } },
                { kind: "Field", name: { kind: "Name", value: "args" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateServiceSourceFromServiceSourceRouteMutation,
  UpdateServiceSourceFromServiceSourceRouteMutationVariables
>;
export const GetDeploymentFromDeploymentLayoutDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getDeploymentFromDeploymentLayout" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deployment" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "projectId" } },
                { kind: "Field", name: { kind: "Name", value: "serviceId" } },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "image" } },
                { kind: "Field", name: { kind: "Name", value: "replicas" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "ports" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "port" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetPort" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "env" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "value" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "envFrom" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "kind" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "prefix" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "command" } },
                { kind: "Field", name: { kind: "Name", value: "args" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "resources" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cpuRequest" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cpuLimit" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "memoryRequest" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "memoryLimit" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "serviceAccountName" },
                },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "active" } },
                { kind: "Field", name: { kind: "Name", value: "latest" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "kubernetesDeploymentName" },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetDeploymentFromDeploymentLayoutQuery,
  GetDeploymentFromDeploymentLayoutQueryVariables
>;
export const GetServiceFromServiceLayoutDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getServiceFromServiceLayout" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "projectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "service" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "projectId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "projectId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "image" } },
                { kind: "Field", name: { kind: "Name", value: "replicas" } },
                { kind: "Field", name: { kind: "Name", value: "command" } },
                { kind: "Field", name: { kind: "Name", value: "args" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "resources" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cpuRequest" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cpuLimit" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "memoryRequest" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "memoryLimit" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "healthCheck" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "port" } },
                      { kind: "Field", name: { kind: "Name", value: "path" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "ports" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "port" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetPort" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "env" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "value" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetServiceFromServiceLayoutQuery,
  GetServiceFromServiceLayoutQueryVariables
>;
export const GetProjectsFromProjectsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getProjectsFromProjectsRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "after" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "before" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "last" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filter" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ProjectFilter" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "orderBy" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ProjectOrder" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "query" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "projects" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "after" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "before" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "before" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "first" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "last" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "last" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "filter" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "filter" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderBy" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "orderBy" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "query" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createdAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "updatedAt" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endCursor" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startCursor" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetProjectsFromProjectsRouteQuery,
  GetProjectsFromProjectsRouteQueryVariables
>;
export const CreateProjectFromProjectsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createProjectFromProjectsRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateProjectInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createProject" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateProjectFromProjectsRouteMutation,
  CreateProjectFromProjectsRouteMutationVariables
>;
export const DeleteProjectFromProjectsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "deleteProjectFromProjectsRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteProject" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteProjectFromProjectsRouteMutation,
  DeleteProjectFromProjectsRouteMutationVariables
>;
export const UpdateWorkspaceFromSettingsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "updateWorkspaceFromSettingsRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateWorkspaceInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateWorkspaceFromSettingsRouteMutation,
  UpdateWorkspaceFromSettingsRouteMutationVariables
>;
export const DeleteWorkspaceFromSettingsRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "deleteWorkspaceFromSettingsRoute" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteWorkspace" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteWorkspaceFromSettingsRouteMutation,
  DeleteWorkspaceFromSettingsRouteMutationVariables
>;
export const CreateWorkspaceFromCreateWorkspaceFormDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createWorkspaceFromCreateWorkspaceForm" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateWorkspaceInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateWorkspaceFromCreateWorkspaceFormMutation,
  CreateWorkspaceFromCreateWorkspaceFormMutationVariables
>;
export const CreateWorkspaceFromCreateWorkspaceRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createWorkspaceFromCreateWorkspaceRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateWorkspaceInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateWorkspaceFromCreateWorkspaceRouteMutation,
  CreateWorkspaceFromCreateWorkspaceRouteMutationVariables
>;
export const GetFirstWorkspaceFromWorkspacesRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getFirstWorkspaceFromWorkspacesRoute" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workspaces" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: { kind: "IntValue", value: "1" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetFirstWorkspaceFromWorkspacesRouteQuery,
  GetFirstWorkspaceFromWorkspacesRouteQueryVariables
>;
export const GetCurrentUserFromAuthLayoutDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getCurrentUserFromAuthLayout" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "currentUser" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCurrentUserFromAuthLayoutQuery,
  GetCurrentUserFromAuthLayoutQueryVariables
>;
export const GetCurrentUserFromInviteRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getCurrentUserFromInviteRoute" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "currentUser" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCurrentUserFromInviteRouteQuery,
  GetCurrentUserFromInviteRouteQueryVariables
>;
export const GetWorkspaceMemberByTokenFromInviteRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getWorkspaceMemberByTokenFromInviteRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "token" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workspaceMemberByToken" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "token" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "token" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "inviteExpiresAt" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetWorkspaceMemberByTokenFromInviteRouteQuery,
  GetWorkspaceMemberByTokenFromInviteRouteQueryVariables
>;
export const AcceptWorkspaceInviteFromInviteRouteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "acceptWorkspaceInviteFromInviteRoute" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "token" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "AcceptWorkspaceInviteInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "acceptWorkspaceInvite" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "token" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "token" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspaceMember" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AcceptWorkspaceInviteFromInviteRouteMutation,
  AcceptWorkspaceInviteFromInviteRouteMutationVariables
>;
