/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  "\n  query getCurrentUserFromAuthenticatedRoute {\n    currentUser {\n      id\n    }\n  }\n": typeof types.GetCurrentUserFromAuthenticatedRouteDocument;
  "\n  query getApiKeysFromApiKeysRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ApiKeyFilter\n    $orderBy: ApiKeyOrder\n    $query: String\n  ) {\n    apiKeys(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          keyPrefix\n          createdAt\n          lastUsedAt\n          expiresAt\n          member {\n            id\n            name\n            email\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n": typeof types.GetApiKeysFromApiKeysRouteDocument;
  "\n  mutation createApiKeyFromApiKeysRoute($input: CreateApiKeyInput!) {\n    createApiKey(input: $input) {\n      apiKey\n      entity {\n        id\n        name\n        keyPrefix\n        createdAt\n        lastUsedAt\n        expiresAt\n        member {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n": typeof types.CreateApiKeyFromApiKeysRouteDocument;
  "\n  mutation updateApiKeyFromApiKeysRoute($id: ID!, $input: UpdateApiKeyInput!) {\n    updateApiKey(id: $id, input: $input) {\n      id\n      name\n      keyPrefix\n      createdAt\n      lastUsedAt\n      expiresAt\n      member {\n        id\n        name\n        email\n      }\n    }\n  }\n": typeof types.UpdateApiKeyFromApiKeysRouteDocument;
  "\n  mutation deleteApiKeyFromApiKeysRoute($id: ID!) {\n    deleteApiKey(id: $id) {\n      id\n      name\n      keyPrefix\n      createdAt\n      lastUsedAt\n      expiresAt\n      member {\n        id\n        name\n        email\n      }\n    }\n  }\n": typeof types.DeleteApiKeyFromApiKeysRouteDocument;
  "\n  query getWorkspacesFromWorkspaceSwitcher(\n    $first: Int\n    $after: String\n    $before: String\n    $query: String\n    $orderBy: WorkspaceOrder\n  ) {\n    workspaces(\n      first: $first\n      after: $after\n      before: $before\n      query: $query\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          id\n          name\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n": typeof types.GetWorkspacesFromWorkspaceSwitcherDocument;
  "\n  query getCurrentUserFromCurrentUserContext {\n    currentUser {\n      id\n      name\n      email\n    }\n  }\n": typeof types.GetCurrentUserFromCurrentUserContextDocument;
  "\n  query getCurrentWorkspaceFromWorkspaceContext {\n    currentWorkspace {\n      id\n      name\n      features\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetCurrentWorkspaceFromWorkspaceContextDocument;
  "\n  query getCurrentWorkspaceMemberFromWorkspaceMemberContext {\n    currentWorkspaceMember {\n      id\n      role\n      name\n      email\n      permissions\n      effectivePermissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n": typeof types.GetCurrentWorkspaceMemberFromWorkspaceMemberContextDocument;
  "\n  query getDomainsFromDomainsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: DomainFilter\n    $orderBy: DomainOrder\n    $query: String\n  ) {\n    domains(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          status\n          verificationToken\n          verifiedAt\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n": typeof types.GetDomainsFromDomainsRouteDocument;
  "\n  mutation createDomainFromDomainsRoute($input: CreateDomainInput!) {\n    createDomain(input: $input) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateDomainFromDomainsRouteDocument;
  "\n  mutation verifyDomainFromDomainsRoute($id: ID!) {\n    verifyDomain(id: $id) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.VerifyDomainFromDomainsRouteDocument;
  "\n  mutation deleteDomainFromDomainsRoute($id: ID!) {\n    deleteDomain(id: $id) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.DeleteDomainFromDomainsRouteDocument;
  "\n  query getCurrentWorkspaceFromWorkspaceLayout {\n    currentWorkspace {\n      id\n    }\n    currentWorkspaceMember {\n      id\n    }\n  }\n": typeof types.GetCurrentWorkspaceFromWorkspaceLayoutDocument;
  "\n  query getWorkspaceMemberGroupFromMemberGroupRoute($id: ID!, $first: Int) {\n    workspaceMemberGroup(id: $id) {\n      id\n      name\n      description\n      permissions\n      members(first: $first) {\n        edges {\n          node {\n            id\n            name\n            email\n            user {\n              id\n              name\n              email\n            }\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetWorkspaceMemberGroupFromMemberGroupRouteDocument;
  "\n  mutation updateWorkspaceMemberGroupFromMemberGroupRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberGroupInput!\n  ) {\n    updateWorkspaceMemberGroup(id: $id, input: $input) {\n      id\n      name\n      description\n      permissions\n    }\n  }\n": typeof types.UpdateWorkspaceMemberGroupFromMemberGroupRouteDocument;
  "\n  mutation deleteWorkspaceMemberGroupFromMemberGroupRoute($id: ID!) {\n    deleteWorkspaceMemberGroup(id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteWorkspaceMemberGroupFromMemberGroupRouteDocument;
  "\n  mutation addMembersToWorkspaceMemberGroupFromMemberGroupRoute(\n    $id: ID!\n    $memberIds: [ID!]!\n  ) {\n    addMembersToWorkspaceMemberGroup(id: $id, memberIds: $memberIds) {\n      id\n    }\n  }\n": typeof types.AddMembersToWorkspaceMemberGroupFromMemberGroupRouteDocument;
  "\n    mutation removeMembersFromWorkspaceMemberGroupFromMemberGroupRoute(\n      $id: ID!\n      $memberIds: [ID!]!\n    ) {\n      removeMembersFromWorkspaceMemberGroup(id: $id, memberIds: $memberIds) {\n        id\n      }\n    }\n  ": typeof types.RemoveMembersFromWorkspaceMemberGroupFromMemberGroupRouteDocument;
  "\n    query getWorkspaceMembersFromWorkspaceMemberGroupMembersManager(\n      $after: String\n      $before: String\n      $first: Int\n      $last: Int\n      $orderBy: WorkspaceMemberOrder\n      $query: String\n    ) {\n      workspaceMembers(\n        after: $after\n        before: $before\n        first: $first\n        last: $last\n        orderBy: $orderBy\n        query: $query\n      ) {\n        edges {\n          node {\n            id\n            name\n            email\n            status\n            user {\n              id\n              name\n              email\n            }\n          }\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n          hasPreviousPage\n          startCursor\n        }\n        totalCount\n      }\n    }\n  ": typeof types.GetWorkspaceMembersFromWorkspaceMemberGroupMembersManagerDocument;
  "\n    mutation createWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRoute(\n      $input: CreateWorkspaceMemberGroupInput!\n    ) {\n      createWorkspaceMemberGroup(input: $input) {\n        id\n        name\n      }\n    }\n  ": typeof types.CreateWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRouteDocument;
  "\n  query getWorkspaceMemberGroupsFromMemberGroupsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: WorkspaceMemberGroupFilter\n    $orderBy: WorkspaceMemberGroupOrder\n    $query: String\n  ) {\n    workspaceMemberGroups(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          description\n          createdAt\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n": typeof types.GetWorkspaceMemberGroupsFromMemberGroupsRouteDocument;
  "\n  query getCurrentWorkspaceMemberFromMemberRoute {\n    currentWorkspaceMember {\n      id\n      role\n    }\n  }\n": typeof types.GetCurrentWorkspaceMemberFromMemberRouteDocument;
  "\n  query getWorkspaceMemberFromMemberRoute($id: ID!) {\n    workspaceMember(id: $id) {\n      id\n      name\n      email\n      role\n      permissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n": typeof types.GetWorkspaceMemberFromMemberRouteDocument;
  "\n  mutation updateWorkspaceMemberFromMemberRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberInput!\n  ) {\n    updateWorkspaceMember(id: $id, input: $input) {\n      id\n      name\n      email\n      role\n      permissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n": typeof types.UpdateWorkspaceMemberFromMemberRouteDocument;
  "\n  mutation removeWorkspaceMemberFromMemberRoute($id: ID!) {\n    removeWorkspaceMember(id: $id) {\n      id\n    }\n  }\n": typeof types.RemoveWorkspaceMemberFromMemberRouteDocument;
  "\n  mutation createWorkspaceInviteFromInviteMemberDialog(\n    $input: CreateWorkspaceInviteInput!\n  ) {\n    createWorkspaceInvite(input: $input) {\n      id\n      inviteToken\n    }\n  }\n": typeof types.CreateWorkspaceInviteFromInviteMemberDialogDocument;
  "\n  query getWorkspaceMembersFromMembersRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: WorkspaceMemberFilter\n    $orderBy: WorkspaceMemberOrder\n    $query: String\n  ) {\n    workspaceMembers(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          email\n          role\n          status\n          createdAt\n          user {\n            id\n            name\n            email\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n": typeof types.GetWorkspaceMembersFromMembersRouteDocument;
  "\n  mutation removeWorkspaceMemberFromMembersRoute($id: ID!) {\n    removeWorkspaceMember(id: $id) {\n      id\n    }\n  }\n": typeof types.RemoveWorkspaceMemberFromMembersRouteDocument;
  "\n  mutation updateWorkspaceMemberStatusFromMembersRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberInput!\n  ) {\n    updateWorkspaceMember(id: $id, input: $input) {\n      id\n      status\n    }\n  }\n": typeof types.UpdateWorkspaceMemberStatusFromMembersRouteDocument;
  "\n    query getRegistryCredentialsFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $after: String\n      $before: String\n      $first: Int\n      $last: Int\n      $filter: RegistryCredentialFilter\n      $orderBy: RegistryCredentialOrder\n      $query: String\n    ) {\n      project(id: $projectId) {\n        id\n        name\n      }\n      registryCredentials(\n        projectId: $projectId\n        after: $after\n        before: $before\n        first: $first\n        last: $last\n        filter: $filter\n        orderBy: $orderBy\n        query: $query\n      ) {\n        edges {\n          node {\n            id\n            projectId\n            name\n            registry\n            username\n            createdAt\n            updatedAt\n          }\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n          hasPreviousPage\n          startCursor\n        }\n      }\n    }\n  ": typeof types.GetRegistryCredentialsFromProjectRegistryCredentialsRouteDocument;
  "\n    mutation createRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $input: CreateRegistryCredentialInput!\n    ) {\n      createRegistryCredential(input: $input) {\n        id\n        projectId\n        name\n        registry\n        username\n        createdAt\n        updatedAt\n      }\n    }\n  ": typeof types.CreateRegistryCredentialFromProjectRegistryCredentialsRouteDocument;
  "\n    mutation updateRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $id: ID!\n      $input: UpdateRegistryCredentialInput!\n    ) {\n      updateRegistryCredential(projectId: $projectId, id: $id, input: $input) {\n        id\n        projectId\n        name\n        registry\n        username\n        createdAt\n        updatedAt\n      }\n    }\n  ": typeof types.UpdateRegistryCredentialFromProjectRegistryCredentialsRouteDocument;
  "\n    mutation deleteRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $id: ID!\n    ) {\n      deleteRegistryCredential(projectId: $projectId, id: $id) {\n        id\n      }\n    }\n  ": typeof types.DeleteRegistryCredentialFromProjectRegistryCredentialsRouteDocument;
  "\n  query getServicesFromServicesRoute(\n    $projectId: ID!\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ServiceFilter\n    $orderBy: ServiceOrder\n    $query: String\n  ) {\n    project(id: $projectId) {\n      id\n      name\n    }\n    registryCredentials(projectId: $projectId, first: 20) {\n      edges {\n        node {\n          id\n          name\n          registry\n        }\n      }\n    }\n    services(\n      projectId: $projectId\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          projectId\n          name\n          image\n          registryCredentialId\n          replicas\n          status\n          createdAt\n          ports {\n            port\n            targetPort\n          }\n          env {\n            key\n            value\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n": typeof types.GetServicesFromServicesRouteDocument;
  "\n  mutation createServiceFromServicesRoute($input: CreateServiceInput!) {\n    createService(input: $input) {\n      id\n      projectId\n      name\n      image\n      registryCredentialId\n      replicas\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      status\n      createdAt\n      ports {\n        port\n        targetPort\n      }\n      env {\n        key\n        value\n      }\n    }\n  }\n": typeof types.CreateServiceFromServicesRouteDocument;
  "\n  mutation deleteServiceFromServicesRoute($projectId: ID!, $id: ID!) {\n    deleteService(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteServiceFromServicesRouteDocument;
  "\n  mutation updateProjectFromProjectRoute(\n    $id: ID!\n    $input: UpdateProjectInput!\n  ) {\n    updateProject(id: $id, input: $input) {\n      id\n      name\n      status\n      updatedAt\n    }\n  }\n": typeof types.UpdateProjectFromProjectRouteDocument;
  "\n  mutation deleteProjectFromProjectRoute($id: ID!) {\n    deleteProject(id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteProjectFromProjectRouteDocument;
  "\n  query getVolumesFromProjectVolumesRoute(\n    $projectId: ID!\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: VolumeFilter\n    $orderBy: VolumeOrder\n    $query: String\n  ) {\n    project(id: $projectId) {\n      id\n      name\n    }\n    volumes(\n      projectId: $projectId\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          projectId\n          name\n          size\n          status\n          createdAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n": typeof types.GetVolumesFromProjectVolumesRouteDocument;
  "\n  mutation createVolumeFromProjectVolumesRoute($input: CreateVolumeInput!) {\n    createVolume(input: $input) {\n      id\n      projectId\n      name\n      size\n      status\n      createdAt\n    }\n  }\n": typeof types.CreateVolumeFromProjectVolumesRouteDocument;
  "\n  mutation deleteVolumeFromProjectVolumesRoute($projectId: ID!, $id: ID!) {\n    deleteVolume(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteVolumeFromProjectVolumesRouteDocument;
  "\n  query getProjectFromProjectLayout($id: ID!) {\n    project(id: $id) {\n      id\n      name\n      status\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetProjectFromProjectLayoutDocument;
  "\n  query getServiceDeploymentsFromServiceDeploymentsRoute(\n    $projectId: ID!\n    $serviceId: ID!\n    $first: Int\n    $orderBy: DeploymentOrder\n  ) {\n    deployments(\n      projectId: $projectId\n      serviceId: $serviceId\n      first: $first\n      orderBy: $orderBy\n    ) {\n      totalCount\n      edges {\n        node {\n          id\n          projectId\n          serviceId\n          version\n          image\n          replicas\n          status\n          active\n          latest\n          kubernetesDeploymentName\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n": typeof types.GetServiceDeploymentsFromServiceDeploymentsRouteDocument;
  "\n  mutation updateServiceEnvironmentFromServiceEnvironmentRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      env {\n        key\n        value\n      }\n      updatedAt\n    }\n  }\n": typeof types.UpdateServiceEnvironmentFromServiceEnvironmentRouteDocument;
  "\n  query getServiceLogsFromServiceLogsRoute(\n    $projectId: ID!\n    $id: ID!\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n  ) {\n    service(projectId: $projectId, id: $id) {\n      id\n      logs(first: $first, after: $after, last: $last, before: $before) {\n        available\n        edges {\n          cursor\n          node {\n            id\n            timestamp\n            level\n            message\n            namespace\n            deploymentName\n          }\n        }\n        pageInfo {\n          startCursor\n          endCursor\n          hasPreviousPage\n          hasNextPage\n        }\n      }\n    }\n  }\n": typeof types.GetServiceLogsFromServiceLogsRouteDocument;
  "\n  query getServiceMetricsFromServiceMetricsRoute(\n    $projectId: ID!\n    $id: ID!\n    $rangeSeconds: Int\n    $stepSeconds: Int\n  ) {\n    service(projectId: $projectId, id: $id) {\n      id\n      metrics(rangeSeconds: $rangeSeconds, stepSeconds: $stepSeconds) {\n        available\n        rangeSeconds\n        stepSeconds\n        cpuLimitMillicores\n        memoryLimitBytes\n        cpuUsageMillicores {\n          timestamp\n          value\n        }\n        memoryUsageBytes {\n          timestamp\n          value\n        }\n        networkReceiveBytesPerSecond {\n          timestamp\n          value\n        }\n        networkTransmitBytesPerSecond {\n          timestamp\n          value\n        }\n      }\n    }\n  }\n": typeof types.GetServiceMetricsFromServiceMetricsRouteDocument;
  "\n  mutation updateServiceNetworkFromServiceNetworkRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      ports {\n        port\n        targetPort\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      updatedAt\n    }\n  }\n": typeof types.UpdateServiceNetworkFromServiceNetworkRouteDocument;
  "\n  mutation updateServiceSettingsFromServiceSettingsRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      name\n      replicas\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      updatedAt\n    }\n  }\n": typeof types.UpdateServiceSettingsFromServiceSettingsRouteDocument;
  "\n  mutation deleteServiceFromServiceSettingsRoute($projectId: ID!, $id: ID!) {\n    deleteService(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteServiceFromServiceSettingsRouteDocument;
  "\n  query getRegistryCredentialsFromServiceSourceRoute($projectId: ID!) {\n    registryCredentials(projectId: $projectId, first: 20) {\n      edges {\n        node {\n          id\n          name\n          registry\n        }\n      }\n    }\n  }\n": typeof types.GetRegistryCredentialsFromServiceSourceRouteDocument;
  "\n  mutation updateServiceSourceFromServiceSourceRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      image\n      registryCredentialId\n      command\n      args\n      updatedAt\n    }\n  }\n": typeof types.UpdateServiceSourceFromServiceSourceRouteDocument;
  "\n  query getDeploymentFromDeploymentLayout($projectId: ID!, $id: ID!) {\n    deployment(projectId: $projectId, id: $id) {\n      id\n      projectId\n      serviceId\n      version\n      image\n      replicas\n      ports {\n        port\n        targetPort\n      }\n      env {\n        name\n        value\n      }\n      envFrom {\n        kind\n        name\n        prefix\n      }\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      serviceAccountName\n      status\n      active\n      latest\n      kubernetesDeploymentName\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetDeploymentFromDeploymentLayoutDocument;
  "\n  query getServiceFromServiceLayout($projectId: ID!, $id: ID!) {\n    service(projectId: $projectId, id: $id) {\n      id\n      projectId\n      name\n      image\n      registryCredentialId\n      replicas\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      status\n      createdAt\n      updatedAt\n      ports {\n        port\n        targetPort\n      }\n      env {\n        key\n        value\n      }\n    }\n  }\n": typeof types.GetServiceFromServiceLayoutDocument;
  "\n  query getProjectsFromProjectsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ProjectFilter\n    $orderBy: ProjectOrder\n    $query: String\n  ) {\n    projects(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          status\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n": typeof types.GetProjectsFromProjectsRouteDocument;
  "\n  mutation createProjectFromProjectsRoute($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      status\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateProjectFromProjectsRouteDocument;
  "\n  mutation deleteProjectFromProjectsRoute($id: ID!) {\n    deleteProject(id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteProjectFromProjectsRouteDocument;
  "\n  mutation updateWorkspaceFromSettingsRoute($input: UpdateWorkspaceInput!) {\n    updateWorkspace(input: $input) {\n      id\n      name\n    }\n  }\n": typeof types.UpdateWorkspaceFromSettingsRouteDocument;
  "\n  mutation deleteWorkspaceFromSettingsRoute {\n    deleteWorkspace {\n      id\n    }\n  }\n": typeof types.DeleteWorkspaceFromSettingsRouteDocument;
  "\n  mutation createWorkspaceFromCreateWorkspaceForm(\n    $input: CreateWorkspaceInput!\n  ) {\n    createWorkspace(input: $input) {\n      id\n    }\n  }\n": typeof types.CreateWorkspaceFromCreateWorkspaceFormDocument;
  "\n  mutation createWorkspaceFromCreateWorkspaceRoute(\n    $input: CreateWorkspaceInput!\n  ) {\n    createWorkspace(input: $input) {\n      id\n    }\n  }\n": typeof types.CreateWorkspaceFromCreateWorkspaceRouteDocument;
  "\n  query getFirstWorkspaceFromWorkspacesRoute {\n    workspaces(first: 1) {\n      edges {\n        node {\n          id\n        }\n      }\n    }\n  }\n": typeof types.GetFirstWorkspaceFromWorkspacesRouteDocument;
  "\n  query getCurrentUserFromAuthLayout {\n    currentUser {\n      id\n    }\n  }\n": typeof types.GetCurrentUserFromAuthLayoutDocument;
  "\n  query getCurrentUserFromInviteRoute {\n    currentUser {\n      id\n      name\n      email\n    }\n  }\n": typeof types.GetCurrentUserFromInviteRouteDocument;
  "\n  query getWorkspaceMemberByTokenFromInviteRoute($token: String!) {\n    workspaceMemberByToken(token: $token) {\n      id\n      name\n      email\n      role\n      status\n      inviteExpiresAt\n    }\n  }\n": typeof types.GetWorkspaceMemberByTokenFromInviteRouteDocument;
  "\n  mutation acceptWorkspaceInviteFromInviteRoute(\n    $token: String!\n    $input: AcceptWorkspaceInviteInput\n  ) {\n    acceptWorkspaceInvite(token: $token, input: $input) {\n      workspaceMember {\n        id\n        name\n        role\n      }\n      workspaceId\n    }\n  }\n": typeof types.AcceptWorkspaceInviteFromInviteRouteDocument;
};
const documents: Documents = {
  "\n  query getCurrentUserFromAuthenticatedRoute {\n    currentUser {\n      id\n    }\n  }\n":
    types.GetCurrentUserFromAuthenticatedRouteDocument,
  "\n  query getApiKeysFromApiKeysRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ApiKeyFilter\n    $orderBy: ApiKeyOrder\n    $query: String\n  ) {\n    apiKeys(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          keyPrefix\n          createdAt\n          lastUsedAt\n          expiresAt\n          member {\n            id\n            name\n            email\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n":
    types.GetApiKeysFromApiKeysRouteDocument,
  "\n  mutation createApiKeyFromApiKeysRoute($input: CreateApiKeyInput!) {\n    createApiKey(input: $input) {\n      apiKey\n      entity {\n        id\n        name\n        keyPrefix\n        createdAt\n        lastUsedAt\n        expiresAt\n        member {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n":
    types.CreateApiKeyFromApiKeysRouteDocument,
  "\n  mutation updateApiKeyFromApiKeysRoute($id: ID!, $input: UpdateApiKeyInput!) {\n    updateApiKey(id: $id, input: $input) {\n      id\n      name\n      keyPrefix\n      createdAt\n      lastUsedAt\n      expiresAt\n      member {\n        id\n        name\n        email\n      }\n    }\n  }\n":
    types.UpdateApiKeyFromApiKeysRouteDocument,
  "\n  mutation deleteApiKeyFromApiKeysRoute($id: ID!) {\n    deleteApiKey(id: $id) {\n      id\n      name\n      keyPrefix\n      createdAt\n      lastUsedAt\n      expiresAt\n      member {\n        id\n        name\n        email\n      }\n    }\n  }\n":
    types.DeleteApiKeyFromApiKeysRouteDocument,
  "\n  query getWorkspacesFromWorkspaceSwitcher(\n    $first: Int\n    $after: String\n    $before: String\n    $query: String\n    $orderBy: WorkspaceOrder\n  ) {\n    workspaces(\n      first: $first\n      after: $after\n      before: $before\n      query: $query\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          id\n          name\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n":
    types.GetWorkspacesFromWorkspaceSwitcherDocument,
  "\n  query getCurrentUserFromCurrentUserContext {\n    currentUser {\n      id\n      name\n      email\n    }\n  }\n":
    types.GetCurrentUserFromCurrentUserContextDocument,
  "\n  query getCurrentWorkspaceFromWorkspaceContext {\n    currentWorkspace {\n      id\n      name\n      features\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.GetCurrentWorkspaceFromWorkspaceContextDocument,
  "\n  query getCurrentWorkspaceMemberFromWorkspaceMemberContext {\n    currentWorkspaceMember {\n      id\n      role\n      name\n      email\n      permissions\n      effectivePermissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n":
    types.GetCurrentWorkspaceMemberFromWorkspaceMemberContextDocument,
  "\n  query getDomainsFromDomainsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: DomainFilter\n    $orderBy: DomainOrder\n    $query: String\n  ) {\n    domains(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          status\n          verificationToken\n          verifiedAt\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n":
    types.GetDomainsFromDomainsRouteDocument,
  "\n  mutation createDomainFromDomainsRoute($input: CreateDomainInput!) {\n    createDomain(input: $input) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.CreateDomainFromDomainsRouteDocument,
  "\n  mutation verifyDomainFromDomainsRoute($id: ID!) {\n    verifyDomain(id: $id) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.VerifyDomainFromDomainsRouteDocument,
  "\n  mutation deleteDomainFromDomainsRoute($id: ID!) {\n    deleteDomain(id: $id) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.DeleteDomainFromDomainsRouteDocument,
  "\n  query getCurrentWorkspaceFromWorkspaceLayout {\n    currentWorkspace {\n      id\n    }\n    currentWorkspaceMember {\n      id\n    }\n  }\n":
    types.GetCurrentWorkspaceFromWorkspaceLayoutDocument,
  "\n  query getWorkspaceMemberGroupFromMemberGroupRoute($id: ID!, $first: Int) {\n    workspaceMemberGroup(id: $id) {\n      id\n      name\n      description\n      permissions\n      members(first: $first) {\n        edges {\n          node {\n            id\n            name\n            email\n            user {\n              id\n              name\n              email\n            }\n          }\n        }\n      }\n    }\n  }\n":
    types.GetWorkspaceMemberGroupFromMemberGroupRouteDocument,
  "\n  mutation updateWorkspaceMemberGroupFromMemberGroupRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberGroupInput!\n  ) {\n    updateWorkspaceMemberGroup(id: $id, input: $input) {\n      id\n      name\n      description\n      permissions\n    }\n  }\n":
    types.UpdateWorkspaceMemberGroupFromMemberGroupRouteDocument,
  "\n  mutation deleteWorkspaceMemberGroupFromMemberGroupRoute($id: ID!) {\n    deleteWorkspaceMemberGroup(id: $id) {\n      id\n    }\n  }\n":
    types.DeleteWorkspaceMemberGroupFromMemberGroupRouteDocument,
  "\n  mutation addMembersToWorkspaceMemberGroupFromMemberGroupRoute(\n    $id: ID!\n    $memberIds: [ID!]!\n  ) {\n    addMembersToWorkspaceMemberGroup(id: $id, memberIds: $memberIds) {\n      id\n    }\n  }\n":
    types.AddMembersToWorkspaceMemberGroupFromMemberGroupRouteDocument,
  "\n    mutation removeMembersFromWorkspaceMemberGroupFromMemberGroupRoute(\n      $id: ID!\n      $memberIds: [ID!]!\n    ) {\n      removeMembersFromWorkspaceMemberGroup(id: $id, memberIds: $memberIds) {\n        id\n      }\n    }\n  ":
    types.RemoveMembersFromWorkspaceMemberGroupFromMemberGroupRouteDocument,
  "\n    query getWorkspaceMembersFromWorkspaceMemberGroupMembersManager(\n      $after: String\n      $before: String\n      $first: Int\n      $last: Int\n      $orderBy: WorkspaceMemberOrder\n      $query: String\n    ) {\n      workspaceMembers(\n        after: $after\n        before: $before\n        first: $first\n        last: $last\n        orderBy: $orderBy\n        query: $query\n      ) {\n        edges {\n          node {\n            id\n            name\n            email\n            status\n            user {\n              id\n              name\n              email\n            }\n          }\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n          hasPreviousPage\n          startCursor\n        }\n        totalCount\n      }\n    }\n  ":
    types.GetWorkspaceMembersFromWorkspaceMemberGroupMembersManagerDocument,
  "\n    mutation createWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRoute(\n      $input: CreateWorkspaceMemberGroupInput!\n    ) {\n      createWorkspaceMemberGroup(input: $input) {\n        id\n        name\n      }\n    }\n  ":
    types.CreateWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRouteDocument,
  "\n  query getWorkspaceMemberGroupsFromMemberGroupsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: WorkspaceMemberGroupFilter\n    $orderBy: WorkspaceMemberGroupOrder\n    $query: String\n  ) {\n    workspaceMemberGroups(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          description\n          createdAt\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n":
    types.GetWorkspaceMemberGroupsFromMemberGroupsRouteDocument,
  "\n  query getCurrentWorkspaceMemberFromMemberRoute {\n    currentWorkspaceMember {\n      id\n      role\n    }\n  }\n":
    types.GetCurrentWorkspaceMemberFromMemberRouteDocument,
  "\n  query getWorkspaceMemberFromMemberRoute($id: ID!) {\n    workspaceMember(id: $id) {\n      id\n      name\n      email\n      role\n      permissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n":
    types.GetWorkspaceMemberFromMemberRouteDocument,
  "\n  mutation updateWorkspaceMemberFromMemberRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberInput!\n  ) {\n    updateWorkspaceMember(id: $id, input: $input) {\n      id\n      name\n      email\n      role\n      permissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n":
    types.UpdateWorkspaceMemberFromMemberRouteDocument,
  "\n  mutation removeWorkspaceMemberFromMemberRoute($id: ID!) {\n    removeWorkspaceMember(id: $id) {\n      id\n    }\n  }\n":
    types.RemoveWorkspaceMemberFromMemberRouteDocument,
  "\n  mutation createWorkspaceInviteFromInviteMemberDialog(\n    $input: CreateWorkspaceInviteInput!\n  ) {\n    createWorkspaceInvite(input: $input) {\n      id\n      inviteToken\n    }\n  }\n":
    types.CreateWorkspaceInviteFromInviteMemberDialogDocument,
  "\n  query getWorkspaceMembersFromMembersRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: WorkspaceMemberFilter\n    $orderBy: WorkspaceMemberOrder\n    $query: String\n  ) {\n    workspaceMembers(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          email\n          role\n          status\n          createdAt\n          user {\n            id\n            name\n            email\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n":
    types.GetWorkspaceMembersFromMembersRouteDocument,
  "\n  mutation removeWorkspaceMemberFromMembersRoute($id: ID!) {\n    removeWorkspaceMember(id: $id) {\n      id\n    }\n  }\n":
    types.RemoveWorkspaceMemberFromMembersRouteDocument,
  "\n  mutation updateWorkspaceMemberStatusFromMembersRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberInput!\n  ) {\n    updateWorkspaceMember(id: $id, input: $input) {\n      id\n      status\n    }\n  }\n":
    types.UpdateWorkspaceMemberStatusFromMembersRouteDocument,
  "\n    query getRegistryCredentialsFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $after: String\n      $before: String\n      $first: Int\n      $last: Int\n      $filter: RegistryCredentialFilter\n      $orderBy: RegistryCredentialOrder\n      $query: String\n    ) {\n      project(id: $projectId) {\n        id\n        name\n      }\n      registryCredentials(\n        projectId: $projectId\n        after: $after\n        before: $before\n        first: $first\n        last: $last\n        filter: $filter\n        orderBy: $orderBy\n        query: $query\n      ) {\n        edges {\n          node {\n            id\n            projectId\n            name\n            registry\n            username\n            createdAt\n            updatedAt\n          }\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n          hasPreviousPage\n          startCursor\n        }\n      }\n    }\n  ":
    types.GetRegistryCredentialsFromProjectRegistryCredentialsRouteDocument,
  "\n    mutation createRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $input: CreateRegistryCredentialInput!\n    ) {\n      createRegistryCredential(input: $input) {\n        id\n        projectId\n        name\n        registry\n        username\n        createdAt\n        updatedAt\n      }\n    }\n  ":
    types.CreateRegistryCredentialFromProjectRegistryCredentialsRouteDocument,
  "\n    mutation updateRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $id: ID!\n      $input: UpdateRegistryCredentialInput!\n    ) {\n      updateRegistryCredential(projectId: $projectId, id: $id, input: $input) {\n        id\n        projectId\n        name\n        registry\n        username\n        createdAt\n        updatedAt\n      }\n    }\n  ":
    types.UpdateRegistryCredentialFromProjectRegistryCredentialsRouteDocument,
  "\n    mutation deleteRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $id: ID!\n    ) {\n      deleteRegistryCredential(projectId: $projectId, id: $id) {\n        id\n      }\n    }\n  ":
    types.DeleteRegistryCredentialFromProjectRegistryCredentialsRouteDocument,
  "\n  query getServicesFromServicesRoute(\n    $projectId: ID!\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ServiceFilter\n    $orderBy: ServiceOrder\n    $query: String\n  ) {\n    project(id: $projectId) {\n      id\n      name\n    }\n    registryCredentials(projectId: $projectId, first: 20) {\n      edges {\n        node {\n          id\n          name\n          registry\n        }\n      }\n    }\n    services(\n      projectId: $projectId\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          projectId\n          name\n          image\n          registryCredentialId\n          replicas\n          status\n          createdAt\n          ports {\n            port\n            targetPort\n          }\n          env {\n            key\n            value\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n":
    types.GetServicesFromServicesRouteDocument,
  "\n  mutation createServiceFromServicesRoute($input: CreateServiceInput!) {\n    createService(input: $input) {\n      id\n      projectId\n      name\n      image\n      registryCredentialId\n      replicas\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      status\n      createdAt\n      ports {\n        port\n        targetPort\n      }\n      env {\n        key\n        value\n      }\n    }\n  }\n":
    types.CreateServiceFromServicesRouteDocument,
  "\n  mutation deleteServiceFromServicesRoute($projectId: ID!, $id: ID!) {\n    deleteService(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n":
    types.DeleteServiceFromServicesRouteDocument,
  "\n  mutation updateProjectFromProjectRoute(\n    $id: ID!\n    $input: UpdateProjectInput!\n  ) {\n    updateProject(id: $id, input: $input) {\n      id\n      name\n      status\n      updatedAt\n    }\n  }\n":
    types.UpdateProjectFromProjectRouteDocument,
  "\n  mutation deleteProjectFromProjectRoute($id: ID!) {\n    deleteProject(id: $id) {\n      id\n    }\n  }\n":
    types.DeleteProjectFromProjectRouteDocument,
  "\n  query getVolumesFromProjectVolumesRoute(\n    $projectId: ID!\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: VolumeFilter\n    $orderBy: VolumeOrder\n    $query: String\n  ) {\n    project(id: $projectId) {\n      id\n      name\n    }\n    volumes(\n      projectId: $projectId\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          projectId\n          name\n          size\n          status\n          createdAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n":
    types.GetVolumesFromProjectVolumesRouteDocument,
  "\n  mutation createVolumeFromProjectVolumesRoute($input: CreateVolumeInput!) {\n    createVolume(input: $input) {\n      id\n      projectId\n      name\n      size\n      status\n      createdAt\n    }\n  }\n":
    types.CreateVolumeFromProjectVolumesRouteDocument,
  "\n  mutation deleteVolumeFromProjectVolumesRoute($projectId: ID!, $id: ID!) {\n    deleteVolume(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n":
    types.DeleteVolumeFromProjectVolumesRouteDocument,
  "\n  query getProjectFromProjectLayout($id: ID!) {\n    project(id: $id) {\n      id\n      name\n      status\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.GetProjectFromProjectLayoutDocument,
  "\n  query getServiceDeploymentsFromServiceDeploymentsRoute(\n    $projectId: ID!\n    $serviceId: ID!\n    $first: Int\n    $orderBy: DeploymentOrder\n  ) {\n    deployments(\n      projectId: $projectId\n      serviceId: $serviceId\n      first: $first\n      orderBy: $orderBy\n    ) {\n      totalCount\n      edges {\n        node {\n          id\n          projectId\n          serviceId\n          version\n          image\n          replicas\n          status\n          active\n          latest\n          kubernetesDeploymentName\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n":
    types.GetServiceDeploymentsFromServiceDeploymentsRouteDocument,
  "\n  mutation updateServiceEnvironmentFromServiceEnvironmentRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      env {\n        key\n        value\n      }\n      updatedAt\n    }\n  }\n":
    types.UpdateServiceEnvironmentFromServiceEnvironmentRouteDocument,
  "\n  query getServiceLogsFromServiceLogsRoute(\n    $projectId: ID!\n    $id: ID!\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n  ) {\n    service(projectId: $projectId, id: $id) {\n      id\n      logs(first: $first, after: $after, last: $last, before: $before) {\n        available\n        edges {\n          cursor\n          node {\n            id\n            timestamp\n            level\n            message\n            namespace\n            deploymentName\n          }\n        }\n        pageInfo {\n          startCursor\n          endCursor\n          hasPreviousPage\n          hasNextPage\n        }\n      }\n    }\n  }\n":
    types.GetServiceLogsFromServiceLogsRouteDocument,
  "\n  query getServiceMetricsFromServiceMetricsRoute(\n    $projectId: ID!\n    $id: ID!\n    $rangeSeconds: Int\n    $stepSeconds: Int\n  ) {\n    service(projectId: $projectId, id: $id) {\n      id\n      metrics(rangeSeconds: $rangeSeconds, stepSeconds: $stepSeconds) {\n        available\n        rangeSeconds\n        stepSeconds\n        cpuLimitMillicores\n        memoryLimitBytes\n        cpuUsageMillicores {\n          timestamp\n          value\n        }\n        memoryUsageBytes {\n          timestamp\n          value\n        }\n        networkReceiveBytesPerSecond {\n          timestamp\n          value\n        }\n        networkTransmitBytesPerSecond {\n          timestamp\n          value\n        }\n      }\n    }\n  }\n":
    types.GetServiceMetricsFromServiceMetricsRouteDocument,
  "\n  mutation updateServiceNetworkFromServiceNetworkRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      ports {\n        port\n        targetPort\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      updatedAt\n    }\n  }\n":
    types.UpdateServiceNetworkFromServiceNetworkRouteDocument,
  "\n  mutation updateServiceSettingsFromServiceSettingsRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      name\n      replicas\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      updatedAt\n    }\n  }\n":
    types.UpdateServiceSettingsFromServiceSettingsRouteDocument,
  "\n  mutation deleteServiceFromServiceSettingsRoute($projectId: ID!, $id: ID!) {\n    deleteService(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n":
    types.DeleteServiceFromServiceSettingsRouteDocument,
  "\n  query getRegistryCredentialsFromServiceSourceRoute($projectId: ID!) {\n    registryCredentials(projectId: $projectId, first: 20) {\n      edges {\n        node {\n          id\n          name\n          registry\n        }\n      }\n    }\n  }\n":
    types.GetRegistryCredentialsFromServiceSourceRouteDocument,
  "\n  mutation updateServiceSourceFromServiceSourceRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      image\n      registryCredentialId\n      command\n      args\n      updatedAt\n    }\n  }\n":
    types.UpdateServiceSourceFromServiceSourceRouteDocument,
  "\n  query getDeploymentFromDeploymentLayout($projectId: ID!, $id: ID!) {\n    deployment(projectId: $projectId, id: $id) {\n      id\n      projectId\n      serviceId\n      version\n      image\n      replicas\n      ports {\n        port\n        targetPort\n      }\n      env {\n        name\n        value\n      }\n      envFrom {\n        kind\n        name\n        prefix\n      }\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      serviceAccountName\n      status\n      active\n      latest\n      kubernetesDeploymentName\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.GetDeploymentFromDeploymentLayoutDocument,
  "\n  query getServiceFromServiceLayout($projectId: ID!, $id: ID!) {\n    service(projectId: $projectId, id: $id) {\n      id\n      projectId\n      name\n      image\n      registryCredentialId\n      replicas\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      status\n      createdAt\n      updatedAt\n      ports {\n        port\n        targetPort\n      }\n      env {\n        key\n        value\n      }\n    }\n  }\n":
    types.GetServiceFromServiceLayoutDocument,
  "\n  query getProjectsFromProjectsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ProjectFilter\n    $orderBy: ProjectOrder\n    $query: String\n  ) {\n    projects(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          status\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n":
    types.GetProjectsFromProjectsRouteDocument,
  "\n  mutation createProjectFromProjectsRoute($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      status\n      createdAt\n      updatedAt\n    }\n  }\n":
    types.CreateProjectFromProjectsRouteDocument,
  "\n  mutation deleteProjectFromProjectsRoute($id: ID!) {\n    deleteProject(id: $id) {\n      id\n    }\n  }\n":
    types.DeleteProjectFromProjectsRouteDocument,
  "\n  mutation updateWorkspaceFromSettingsRoute($input: UpdateWorkspaceInput!) {\n    updateWorkspace(input: $input) {\n      id\n      name\n    }\n  }\n":
    types.UpdateWorkspaceFromSettingsRouteDocument,
  "\n  mutation deleteWorkspaceFromSettingsRoute {\n    deleteWorkspace {\n      id\n    }\n  }\n":
    types.DeleteWorkspaceFromSettingsRouteDocument,
  "\n  mutation createWorkspaceFromCreateWorkspaceForm(\n    $input: CreateWorkspaceInput!\n  ) {\n    createWorkspace(input: $input) {\n      id\n    }\n  }\n":
    types.CreateWorkspaceFromCreateWorkspaceFormDocument,
  "\n  mutation createWorkspaceFromCreateWorkspaceRoute(\n    $input: CreateWorkspaceInput!\n  ) {\n    createWorkspace(input: $input) {\n      id\n    }\n  }\n":
    types.CreateWorkspaceFromCreateWorkspaceRouteDocument,
  "\n  query getFirstWorkspaceFromWorkspacesRoute {\n    workspaces(first: 1) {\n      edges {\n        node {\n          id\n        }\n      }\n    }\n  }\n":
    types.GetFirstWorkspaceFromWorkspacesRouteDocument,
  "\n  query getCurrentUserFromAuthLayout {\n    currentUser {\n      id\n    }\n  }\n":
    types.GetCurrentUserFromAuthLayoutDocument,
  "\n  query getCurrentUserFromInviteRoute {\n    currentUser {\n      id\n      name\n      email\n    }\n  }\n":
    types.GetCurrentUserFromInviteRouteDocument,
  "\n  query getWorkspaceMemberByTokenFromInviteRoute($token: String!) {\n    workspaceMemberByToken(token: $token) {\n      id\n      name\n      email\n      role\n      status\n      inviteExpiresAt\n    }\n  }\n":
    types.GetWorkspaceMemberByTokenFromInviteRouteDocument,
  "\n  mutation acceptWorkspaceInviteFromInviteRoute(\n    $token: String!\n    $input: AcceptWorkspaceInviteInput\n  ) {\n    acceptWorkspaceInvite(token: $token, input: $input) {\n      workspaceMember {\n        id\n        name\n        role\n      }\n      workspaceId\n    }\n  }\n":
    types.AcceptWorkspaceInviteFromInviteRouteDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getCurrentUserFromAuthenticatedRoute {\n    currentUser {\n      id\n    }\n  }\n",
): (typeof documents)["\n  query getCurrentUserFromAuthenticatedRoute {\n    currentUser {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getApiKeysFromApiKeysRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ApiKeyFilter\n    $orderBy: ApiKeyOrder\n    $query: String\n  ) {\n    apiKeys(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          keyPrefix\n          createdAt\n          lastUsedAt\n          expiresAt\n          member {\n            id\n            name\n            email\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getApiKeysFromApiKeysRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ApiKeyFilter\n    $orderBy: ApiKeyOrder\n    $query: String\n  ) {\n    apiKeys(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          keyPrefix\n          createdAt\n          lastUsedAt\n          expiresAt\n          member {\n            id\n            name\n            email\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation createApiKeyFromApiKeysRoute($input: CreateApiKeyInput!) {\n    createApiKey(input: $input) {\n      apiKey\n      entity {\n        id\n        name\n        keyPrefix\n        createdAt\n        lastUsedAt\n        expiresAt\n        member {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation createApiKeyFromApiKeysRoute($input: CreateApiKeyInput!) {\n    createApiKey(input: $input) {\n      apiKey\n      entity {\n        id\n        name\n        keyPrefix\n        createdAt\n        lastUsedAt\n        expiresAt\n        member {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateApiKeyFromApiKeysRoute($id: ID!, $input: UpdateApiKeyInput!) {\n    updateApiKey(id: $id, input: $input) {\n      id\n      name\n      keyPrefix\n      createdAt\n      lastUsedAt\n      expiresAt\n      member {\n        id\n        name\n        email\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation updateApiKeyFromApiKeysRoute($id: ID!, $input: UpdateApiKeyInput!) {\n    updateApiKey(id: $id, input: $input) {\n      id\n      name\n      keyPrefix\n      createdAt\n      lastUsedAt\n      expiresAt\n      member {\n        id\n        name\n        email\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation deleteApiKeyFromApiKeysRoute($id: ID!) {\n    deleteApiKey(id: $id) {\n      id\n      name\n      keyPrefix\n      createdAt\n      lastUsedAt\n      expiresAt\n      member {\n        id\n        name\n        email\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation deleteApiKeyFromApiKeysRoute($id: ID!) {\n    deleteApiKey(id: $id) {\n      id\n      name\n      keyPrefix\n      createdAt\n      lastUsedAt\n      expiresAt\n      member {\n        id\n        name\n        email\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getWorkspacesFromWorkspaceSwitcher(\n    $first: Int\n    $after: String\n    $before: String\n    $query: String\n    $orderBy: WorkspaceOrder\n  ) {\n    workspaces(\n      first: $first\n      after: $after\n      before: $before\n      query: $query\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          id\n          name\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n",
): (typeof documents)["\n  query getWorkspacesFromWorkspaceSwitcher(\n    $first: Int\n    $after: String\n    $before: String\n    $query: String\n    $orderBy: WorkspaceOrder\n  ) {\n    workspaces(\n      first: $first\n      after: $after\n      before: $before\n      query: $query\n      orderBy: $orderBy\n    ) {\n      edges {\n        node {\n          id\n          name\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getCurrentUserFromCurrentUserContext {\n    currentUser {\n      id\n      name\n      email\n    }\n  }\n",
): (typeof documents)["\n  query getCurrentUserFromCurrentUserContext {\n    currentUser {\n      id\n      name\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getCurrentWorkspaceFromWorkspaceContext {\n    currentWorkspace {\n      id\n      name\n      features\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  query getCurrentWorkspaceFromWorkspaceContext {\n    currentWorkspace {\n      id\n      name\n      features\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getCurrentWorkspaceMemberFromWorkspaceMemberContext {\n    currentWorkspaceMember {\n      id\n      role\n      name\n      email\n      permissions\n      effectivePermissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getCurrentWorkspaceMemberFromWorkspaceMemberContext {\n    currentWorkspaceMember {\n      id\n      role\n      name\n      email\n      permissions\n      effectivePermissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getDomainsFromDomainsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: DomainFilter\n    $orderBy: DomainOrder\n    $query: String\n  ) {\n    domains(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          status\n          verificationToken\n          verifiedAt\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getDomainsFromDomainsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: DomainFilter\n    $orderBy: DomainOrder\n    $query: String\n  ) {\n    domains(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          status\n          verificationToken\n          verifiedAt\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation createDomainFromDomainsRoute($input: CreateDomainInput!) {\n    createDomain(input: $input) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation createDomainFromDomainsRoute($input: CreateDomainInput!) {\n    createDomain(input: $input) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation verifyDomainFromDomainsRoute($id: ID!) {\n    verifyDomain(id: $id) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation verifyDomainFromDomainsRoute($id: ID!) {\n    verifyDomain(id: $id) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation deleteDomainFromDomainsRoute($id: ID!) {\n    deleteDomain(id: $id) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation deleteDomainFromDomainsRoute($id: ID!) {\n    deleteDomain(id: $id) {\n      id\n      name\n      status\n      verificationToken\n      verifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getCurrentWorkspaceFromWorkspaceLayout {\n    currentWorkspace {\n      id\n    }\n    currentWorkspaceMember {\n      id\n    }\n  }\n",
): (typeof documents)["\n  query getCurrentWorkspaceFromWorkspaceLayout {\n    currentWorkspace {\n      id\n    }\n    currentWorkspaceMember {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getWorkspaceMemberGroupFromMemberGroupRoute($id: ID!, $first: Int) {\n    workspaceMemberGroup(id: $id) {\n      id\n      name\n      description\n      permissions\n      members(first: $first) {\n        edges {\n          node {\n            id\n            name\n            email\n            user {\n              id\n              name\n              email\n            }\n          }\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getWorkspaceMemberGroupFromMemberGroupRoute($id: ID!, $first: Int) {\n    workspaceMemberGroup(id: $id) {\n      id\n      name\n      description\n      permissions\n      members(first: $first) {\n        edges {\n          node {\n            id\n            name\n            email\n            user {\n              id\n              name\n              email\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateWorkspaceMemberGroupFromMemberGroupRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberGroupInput!\n  ) {\n    updateWorkspaceMemberGroup(id: $id, input: $input) {\n      id\n      name\n      description\n      permissions\n    }\n  }\n",
): (typeof documents)["\n  mutation updateWorkspaceMemberGroupFromMemberGroupRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberGroupInput!\n  ) {\n    updateWorkspaceMemberGroup(id: $id, input: $input) {\n      id\n      name\n      description\n      permissions\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation deleteWorkspaceMemberGroupFromMemberGroupRoute($id: ID!) {\n    deleteWorkspaceMemberGroup(id: $id) {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation deleteWorkspaceMemberGroupFromMemberGroupRoute($id: ID!) {\n    deleteWorkspaceMemberGroup(id: $id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation addMembersToWorkspaceMemberGroupFromMemberGroupRoute(\n    $id: ID!\n    $memberIds: [ID!]!\n  ) {\n    addMembersToWorkspaceMemberGroup(id: $id, memberIds: $memberIds) {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation addMembersToWorkspaceMemberGroupFromMemberGroupRoute(\n    $id: ID!\n    $memberIds: [ID!]!\n  ) {\n    addMembersToWorkspaceMemberGroup(id: $id, memberIds: $memberIds) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    mutation removeMembersFromWorkspaceMemberGroupFromMemberGroupRoute(\n      $id: ID!\n      $memberIds: [ID!]!\n    ) {\n      removeMembersFromWorkspaceMemberGroup(id: $id, memberIds: $memberIds) {\n        id\n      }\n    }\n  ",
): (typeof documents)["\n    mutation removeMembersFromWorkspaceMemberGroupFromMemberGroupRoute(\n      $id: ID!\n      $memberIds: [ID!]!\n    ) {\n      removeMembersFromWorkspaceMemberGroup(id: $id, memberIds: $memberIds) {\n        id\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    query getWorkspaceMembersFromWorkspaceMemberGroupMembersManager(\n      $after: String\n      $before: String\n      $first: Int\n      $last: Int\n      $orderBy: WorkspaceMemberOrder\n      $query: String\n    ) {\n      workspaceMembers(\n        after: $after\n        before: $before\n        first: $first\n        last: $last\n        orderBy: $orderBy\n        query: $query\n      ) {\n        edges {\n          node {\n            id\n            name\n            email\n            status\n            user {\n              id\n              name\n              email\n            }\n          }\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n          hasPreviousPage\n          startCursor\n        }\n        totalCount\n      }\n    }\n  ",
): (typeof documents)["\n    query getWorkspaceMembersFromWorkspaceMemberGroupMembersManager(\n      $after: String\n      $before: String\n      $first: Int\n      $last: Int\n      $orderBy: WorkspaceMemberOrder\n      $query: String\n    ) {\n      workspaceMembers(\n        after: $after\n        before: $before\n        first: $first\n        last: $last\n        orderBy: $orderBy\n        query: $query\n      ) {\n        edges {\n          node {\n            id\n            name\n            email\n            status\n            user {\n              id\n              name\n              email\n            }\n          }\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n          hasPreviousPage\n          startCursor\n        }\n        totalCount\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    mutation createWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRoute(\n      $input: CreateWorkspaceMemberGroupInput!\n    ) {\n      createWorkspaceMemberGroup(input: $input) {\n        id\n        name\n      }\n    }\n  ",
): (typeof documents)["\n    mutation createWorkspaceMemberGroupFromCreateWorkspaceMemberGroupRoute(\n      $input: CreateWorkspaceMemberGroupInput!\n    ) {\n      createWorkspaceMemberGroup(input: $input) {\n        id\n        name\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getWorkspaceMemberGroupsFromMemberGroupsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: WorkspaceMemberGroupFilter\n    $orderBy: WorkspaceMemberGroupOrder\n    $query: String\n  ) {\n    workspaceMemberGroups(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          description\n          createdAt\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getWorkspaceMemberGroupsFromMemberGroupsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: WorkspaceMemberGroupFilter\n    $orderBy: WorkspaceMemberGroupOrder\n    $query: String\n  ) {\n    workspaceMemberGroups(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          description\n          createdAt\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getCurrentWorkspaceMemberFromMemberRoute {\n    currentWorkspaceMember {\n      id\n      role\n    }\n  }\n",
): (typeof documents)["\n  query getCurrentWorkspaceMemberFromMemberRoute {\n    currentWorkspaceMember {\n      id\n      role\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getWorkspaceMemberFromMemberRoute($id: ID!) {\n    workspaceMember(id: $id) {\n      id\n      name\n      email\n      role\n      permissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getWorkspaceMemberFromMemberRoute($id: ID!) {\n    workspaceMember(id: $id) {\n      id\n      name\n      email\n      role\n      permissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateWorkspaceMemberFromMemberRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberInput!\n  ) {\n    updateWorkspaceMember(id: $id, input: $input) {\n      id\n      name\n      email\n      role\n      permissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation updateWorkspaceMemberFromMemberRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberInput!\n  ) {\n    updateWorkspaceMember(id: $id, input: $input) {\n      id\n      name\n      email\n      role\n      permissions\n      inviteToken\n      status\n      inviteExpiresAt\n      invitedBy {\n        name\n        email\n      }\n      invitedByUserName\n      user {\n        email\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation removeWorkspaceMemberFromMemberRoute($id: ID!) {\n    removeWorkspaceMember(id: $id) {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation removeWorkspaceMemberFromMemberRoute($id: ID!) {\n    removeWorkspaceMember(id: $id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation createWorkspaceInviteFromInviteMemberDialog(\n    $input: CreateWorkspaceInviteInput!\n  ) {\n    createWorkspaceInvite(input: $input) {\n      id\n      inviteToken\n    }\n  }\n",
): (typeof documents)["\n  mutation createWorkspaceInviteFromInviteMemberDialog(\n    $input: CreateWorkspaceInviteInput!\n  ) {\n    createWorkspaceInvite(input: $input) {\n      id\n      inviteToken\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getWorkspaceMembersFromMembersRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: WorkspaceMemberFilter\n    $orderBy: WorkspaceMemberOrder\n    $query: String\n  ) {\n    workspaceMembers(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          email\n          role\n          status\n          createdAt\n          user {\n            id\n            name\n            email\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getWorkspaceMembersFromMembersRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: WorkspaceMemberFilter\n    $orderBy: WorkspaceMemberOrder\n    $query: String\n  ) {\n    workspaceMembers(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      orderBy: $orderBy\n      filter: $filter\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          email\n          role\n          status\n          createdAt\n          user {\n            id\n            name\n            email\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation removeWorkspaceMemberFromMembersRoute($id: ID!) {\n    removeWorkspaceMember(id: $id) {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation removeWorkspaceMemberFromMembersRoute($id: ID!) {\n    removeWorkspaceMember(id: $id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateWorkspaceMemberStatusFromMembersRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberInput!\n  ) {\n    updateWorkspaceMember(id: $id, input: $input) {\n      id\n      status\n    }\n  }\n",
): (typeof documents)["\n  mutation updateWorkspaceMemberStatusFromMembersRoute(\n    $id: ID!\n    $input: UpdateWorkspaceMemberInput!\n  ) {\n    updateWorkspaceMember(id: $id, input: $input) {\n      id\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    query getRegistryCredentialsFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $after: String\n      $before: String\n      $first: Int\n      $last: Int\n      $filter: RegistryCredentialFilter\n      $orderBy: RegistryCredentialOrder\n      $query: String\n    ) {\n      project(id: $projectId) {\n        id\n        name\n      }\n      registryCredentials(\n        projectId: $projectId\n        after: $after\n        before: $before\n        first: $first\n        last: $last\n        filter: $filter\n        orderBy: $orderBy\n        query: $query\n      ) {\n        edges {\n          node {\n            id\n            projectId\n            name\n            registry\n            username\n            createdAt\n            updatedAt\n          }\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n          hasPreviousPage\n          startCursor\n        }\n      }\n    }\n  ",
): (typeof documents)["\n    query getRegistryCredentialsFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $after: String\n      $before: String\n      $first: Int\n      $last: Int\n      $filter: RegistryCredentialFilter\n      $orderBy: RegistryCredentialOrder\n      $query: String\n    ) {\n      project(id: $projectId) {\n        id\n        name\n      }\n      registryCredentials(\n        projectId: $projectId\n        after: $after\n        before: $before\n        first: $first\n        last: $last\n        filter: $filter\n        orderBy: $orderBy\n        query: $query\n      ) {\n        edges {\n          node {\n            id\n            projectId\n            name\n            registry\n            username\n            createdAt\n            updatedAt\n          }\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n          hasPreviousPage\n          startCursor\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    mutation createRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $input: CreateRegistryCredentialInput!\n    ) {\n      createRegistryCredential(input: $input) {\n        id\n        projectId\n        name\n        registry\n        username\n        createdAt\n        updatedAt\n      }\n    }\n  ",
): (typeof documents)["\n    mutation createRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $input: CreateRegistryCredentialInput!\n    ) {\n      createRegistryCredential(input: $input) {\n        id\n        projectId\n        name\n        registry\n        username\n        createdAt\n        updatedAt\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    mutation updateRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $id: ID!\n      $input: UpdateRegistryCredentialInput!\n    ) {\n      updateRegistryCredential(projectId: $projectId, id: $id, input: $input) {\n        id\n        projectId\n        name\n        registry\n        username\n        createdAt\n        updatedAt\n      }\n    }\n  ",
): (typeof documents)["\n    mutation updateRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $id: ID!\n      $input: UpdateRegistryCredentialInput!\n    ) {\n      updateRegistryCredential(projectId: $projectId, id: $id, input: $input) {\n        id\n        projectId\n        name\n        registry\n        username\n        createdAt\n        updatedAt\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    mutation deleteRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $id: ID!\n    ) {\n      deleteRegistryCredential(projectId: $projectId, id: $id) {\n        id\n      }\n    }\n  ",
): (typeof documents)["\n    mutation deleteRegistryCredentialFromProjectRegistryCredentialsRoute(\n      $projectId: ID!\n      $id: ID!\n    ) {\n      deleteRegistryCredential(projectId: $projectId, id: $id) {\n        id\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getServicesFromServicesRoute(\n    $projectId: ID!\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ServiceFilter\n    $orderBy: ServiceOrder\n    $query: String\n  ) {\n    project(id: $projectId) {\n      id\n      name\n    }\n    registryCredentials(projectId: $projectId, first: 20) {\n      edges {\n        node {\n          id\n          name\n          registry\n        }\n      }\n    }\n    services(\n      projectId: $projectId\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          projectId\n          name\n          image\n          registryCredentialId\n          replicas\n          status\n          createdAt\n          ports {\n            port\n            targetPort\n          }\n          env {\n            key\n            value\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getServicesFromServicesRoute(\n    $projectId: ID!\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ServiceFilter\n    $orderBy: ServiceOrder\n    $query: String\n  ) {\n    project(id: $projectId) {\n      id\n      name\n    }\n    registryCredentials(projectId: $projectId, first: 20) {\n      edges {\n        node {\n          id\n          name\n          registry\n        }\n      }\n    }\n    services(\n      projectId: $projectId\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          projectId\n          name\n          image\n          registryCredentialId\n          replicas\n          status\n          createdAt\n          ports {\n            port\n            targetPort\n          }\n          env {\n            key\n            value\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation createServiceFromServicesRoute($input: CreateServiceInput!) {\n    createService(input: $input) {\n      id\n      projectId\n      name\n      image\n      registryCredentialId\n      replicas\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      status\n      createdAt\n      ports {\n        port\n        targetPort\n      }\n      env {\n        key\n        value\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation createServiceFromServicesRoute($input: CreateServiceInput!) {\n    createService(input: $input) {\n      id\n      projectId\n      name\n      image\n      registryCredentialId\n      replicas\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      status\n      createdAt\n      ports {\n        port\n        targetPort\n      }\n      env {\n        key\n        value\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation deleteServiceFromServicesRoute($projectId: ID!, $id: ID!) {\n    deleteService(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation deleteServiceFromServicesRoute($projectId: ID!, $id: ID!) {\n    deleteService(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateProjectFromProjectRoute(\n    $id: ID!\n    $input: UpdateProjectInput!\n  ) {\n    updateProject(id: $id, input: $input) {\n      id\n      name\n      status\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation updateProjectFromProjectRoute(\n    $id: ID!\n    $input: UpdateProjectInput!\n  ) {\n    updateProject(id: $id, input: $input) {\n      id\n      name\n      status\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation deleteProjectFromProjectRoute($id: ID!) {\n    deleteProject(id: $id) {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation deleteProjectFromProjectRoute($id: ID!) {\n    deleteProject(id: $id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getVolumesFromProjectVolumesRoute(\n    $projectId: ID!\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: VolumeFilter\n    $orderBy: VolumeOrder\n    $query: String\n  ) {\n    project(id: $projectId) {\n      id\n      name\n    }\n    volumes(\n      projectId: $projectId\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          projectId\n          name\n          size\n          status\n          createdAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getVolumesFromProjectVolumesRoute(\n    $projectId: ID!\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: VolumeFilter\n    $orderBy: VolumeOrder\n    $query: String\n  ) {\n    project(id: $projectId) {\n      id\n      name\n    }\n    volumes(\n      projectId: $projectId\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          projectId\n          name\n          size\n          status\n          createdAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation createVolumeFromProjectVolumesRoute($input: CreateVolumeInput!) {\n    createVolume(input: $input) {\n      id\n      projectId\n      name\n      size\n      status\n      createdAt\n    }\n  }\n",
): (typeof documents)["\n  mutation createVolumeFromProjectVolumesRoute($input: CreateVolumeInput!) {\n    createVolume(input: $input) {\n      id\n      projectId\n      name\n      size\n      status\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation deleteVolumeFromProjectVolumesRoute($projectId: ID!, $id: ID!) {\n    deleteVolume(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation deleteVolumeFromProjectVolumesRoute($projectId: ID!, $id: ID!) {\n    deleteVolume(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getProjectFromProjectLayout($id: ID!) {\n    project(id: $id) {\n      id\n      name\n      status\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  query getProjectFromProjectLayout($id: ID!) {\n    project(id: $id) {\n      id\n      name\n      status\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getServiceDeploymentsFromServiceDeploymentsRoute(\n    $projectId: ID!\n    $serviceId: ID!\n    $first: Int\n    $orderBy: DeploymentOrder\n  ) {\n    deployments(\n      projectId: $projectId\n      serviceId: $serviceId\n      first: $first\n      orderBy: $orderBy\n    ) {\n      totalCount\n      edges {\n        node {\n          id\n          projectId\n          serviceId\n          version\n          image\n          replicas\n          status\n          active\n          latest\n          kubernetesDeploymentName\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getServiceDeploymentsFromServiceDeploymentsRoute(\n    $projectId: ID!\n    $serviceId: ID!\n    $first: Int\n    $orderBy: DeploymentOrder\n  ) {\n    deployments(\n      projectId: $projectId\n      serviceId: $serviceId\n      first: $first\n      orderBy: $orderBy\n    ) {\n      totalCount\n      edges {\n        node {\n          id\n          projectId\n          serviceId\n          version\n          image\n          replicas\n          status\n          active\n          latest\n          kubernetesDeploymentName\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateServiceEnvironmentFromServiceEnvironmentRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      env {\n        key\n        value\n      }\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation updateServiceEnvironmentFromServiceEnvironmentRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      env {\n        key\n        value\n      }\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getServiceLogsFromServiceLogsRoute(\n    $projectId: ID!\n    $id: ID!\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n  ) {\n    service(projectId: $projectId, id: $id) {\n      id\n      logs(first: $first, after: $after, last: $last, before: $before) {\n        available\n        edges {\n          cursor\n          node {\n            id\n            timestamp\n            level\n            message\n            namespace\n            deploymentName\n          }\n        }\n        pageInfo {\n          startCursor\n          endCursor\n          hasPreviousPage\n          hasNextPage\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getServiceLogsFromServiceLogsRoute(\n    $projectId: ID!\n    $id: ID!\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n  ) {\n    service(projectId: $projectId, id: $id) {\n      id\n      logs(first: $first, after: $after, last: $last, before: $before) {\n        available\n        edges {\n          cursor\n          node {\n            id\n            timestamp\n            level\n            message\n            namespace\n            deploymentName\n          }\n        }\n        pageInfo {\n          startCursor\n          endCursor\n          hasPreviousPage\n          hasNextPage\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getServiceMetricsFromServiceMetricsRoute(\n    $projectId: ID!\n    $id: ID!\n    $rangeSeconds: Int\n    $stepSeconds: Int\n  ) {\n    service(projectId: $projectId, id: $id) {\n      id\n      metrics(rangeSeconds: $rangeSeconds, stepSeconds: $stepSeconds) {\n        available\n        rangeSeconds\n        stepSeconds\n        cpuLimitMillicores\n        memoryLimitBytes\n        cpuUsageMillicores {\n          timestamp\n          value\n        }\n        memoryUsageBytes {\n          timestamp\n          value\n        }\n        networkReceiveBytesPerSecond {\n          timestamp\n          value\n        }\n        networkTransmitBytesPerSecond {\n          timestamp\n          value\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getServiceMetricsFromServiceMetricsRoute(\n    $projectId: ID!\n    $id: ID!\n    $rangeSeconds: Int\n    $stepSeconds: Int\n  ) {\n    service(projectId: $projectId, id: $id) {\n      id\n      metrics(rangeSeconds: $rangeSeconds, stepSeconds: $stepSeconds) {\n        available\n        rangeSeconds\n        stepSeconds\n        cpuLimitMillicores\n        memoryLimitBytes\n        cpuUsageMillicores {\n          timestamp\n          value\n        }\n        memoryUsageBytes {\n          timestamp\n          value\n        }\n        networkReceiveBytesPerSecond {\n          timestamp\n          value\n        }\n        networkTransmitBytesPerSecond {\n          timestamp\n          value\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateServiceNetworkFromServiceNetworkRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      ports {\n        port\n        targetPort\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation updateServiceNetworkFromServiceNetworkRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      ports {\n        port\n        targetPort\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateServiceSettingsFromServiceSettingsRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      name\n      replicas\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation updateServiceSettingsFromServiceSettingsRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      name\n      replicas\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation deleteServiceFromServiceSettingsRoute($projectId: ID!, $id: ID!) {\n    deleteService(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation deleteServiceFromServiceSettingsRoute($projectId: ID!, $id: ID!) {\n    deleteService(projectId: $projectId, id: $id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getRegistryCredentialsFromServiceSourceRoute($projectId: ID!) {\n    registryCredentials(projectId: $projectId, first: 20) {\n      edges {\n        node {\n          id\n          name\n          registry\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getRegistryCredentialsFromServiceSourceRoute($projectId: ID!) {\n    registryCredentials(projectId: $projectId, first: 20) {\n      edges {\n        node {\n          id\n          name\n          registry\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateServiceSourceFromServiceSourceRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      image\n      registryCredentialId\n      command\n      args\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation updateServiceSourceFromServiceSourceRoute(\n    $projectId: ID!\n    $id: ID!\n    $input: UpdateServiceInput!\n  ) {\n    updateService(projectId: $projectId, id: $id, input: $input) {\n      id\n      image\n      registryCredentialId\n      command\n      args\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getDeploymentFromDeploymentLayout($projectId: ID!, $id: ID!) {\n    deployment(projectId: $projectId, id: $id) {\n      id\n      projectId\n      serviceId\n      version\n      image\n      replicas\n      ports {\n        port\n        targetPort\n      }\n      env {\n        name\n        value\n      }\n      envFrom {\n        kind\n        name\n        prefix\n      }\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      serviceAccountName\n      status\n      active\n      latest\n      kubernetesDeploymentName\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  query getDeploymentFromDeploymentLayout($projectId: ID!, $id: ID!) {\n    deployment(projectId: $projectId, id: $id) {\n      id\n      projectId\n      serviceId\n      version\n      image\n      replicas\n      ports {\n        port\n        targetPort\n      }\n      env {\n        name\n        value\n      }\n      envFrom {\n        kind\n        name\n        prefix\n      }\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      serviceAccountName\n      status\n      active\n      latest\n      kubernetesDeploymentName\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getServiceFromServiceLayout($projectId: ID!, $id: ID!) {\n    service(projectId: $projectId, id: $id) {\n      id\n      projectId\n      name\n      image\n      registryCredentialId\n      replicas\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      status\n      createdAt\n      updatedAt\n      ports {\n        port\n        targetPort\n      }\n      env {\n        key\n        value\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getServiceFromServiceLayout($projectId: ID!, $id: ID!) {\n    service(projectId: $projectId, id: $id) {\n      id\n      projectId\n      name\n      image\n      registryCredentialId\n      replicas\n      command\n      args\n      resources {\n        cpuRequest\n        cpuLimit\n        memoryRequest\n        memoryLimit\n      }\n      healthCheck {\n        type\n        port\n        path\n      }\n      status\n      createdAt\n      updatedAt\n      ports {\n        port\n        targetPort\n      }\n      env {\n        key\n        value\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getProjectsFromProjectsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ProjectFilter\n    $orderBy: ProjectOrder\n    $query: String\n  ) {\n    projects(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          status\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getProjectsFromProjectsRoute(\n    $after: String\n    $before: String\n    $first: Int\n    $last: Int\n    $filter: ProjectFilter\n    $orderBy: ProjectOrder\n    $query: String\n  ) {\n    projects(\n      after: $after\n      before: $before\n      first: $first\n      last: $last\n      filter: $filter\n      orderBy: $orderBy\n      query: $query\n    ) {\n      edges {\n        node {\n          id\n          name\n          status\n          createdAt\n          updatedAt\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation createProjectFromProjectsRoute($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      status\n      createdAt\n      updatedAt\n    }\n  }\n",
): (typeof documents)["\n  mutation createProjectFromProjectsRoute($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      status\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation deleteProjectFromProjectsRoute($id: ID!) {\n    deleteProject(id: $id) {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation deleteProjectFromProjectsRoute($id: ID!) {\n    deleteProject(id: $id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateWorkspaceFromSettingsRoute($input: UpdateWorkspaceInput!) {\n    updateWorkspace(input: $input) {\n      id\n      name\n    }\n  }\n",
): (typeof documents)["\n  mutation updateWorkspaceFromSettingsRoute($input: UpdateWorkspaceInput!) {\n    updateWorkspace(input: $input) {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation deleteWorkspaceFromSettingsRoute {\n    deleteWorkspace {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation deleteWorkspaceFromSettingsRoute {\n    deleteWorkspace {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation createWorkspaceFromCreateWorkspaceForm(\n    $input: CreateWorkspaceInput!\n  ) {\n    createWorkspace(input: $input) {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation createWorkspaceFromCreateWorkspaceForm(\n    $input: CreateWorkspaceInput!\n  ) {\n    createWorkspace(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation createWorkspaceFromCreateWorkspaceRoute(\n    $input: CreateWorkspaceInput!\n  ) {\n    createWorkspace(input: $input) {\n      id\n    }\n  }\n",
): (typeof documents)["\n  mutation createWorkspaceFromCreateWorkspaceRoute(\n    $input: CreateWorkspaceInput!\n  ) {\n    createWorkspace(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getFirstWorkspaceFromWorkspacesRoute {\n    workspaces(first: 1) {\n      edges {\n        node {\n          id\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  query getFirstWorkspaceFromWorkspacesRoute {\n    workspaces(first: 1) {\n      edges {\n        node {\n          id\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getCurrentUserFromAuthLayout {\n    currentUser {\n      id\n    }\n  }\n",
): (typeof documents)["\n  query getCurrentUserFromAuthLayout {\n    currentUser {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getCurrentUserFromInviteRoute {\n    currentUser {\n      id\n      name\n      email\n    }\n  }\n",
): (typeof documents)["\n  query getCurrentUserFromInviteRoute {\n    currentUser {\n      id\n      name\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getWorkspaceMemberByTokenFromInviteRoute($token: String!) {\n    workspaceMemberByToken(token: $token) {\n      id\n      name\n      email\n      role\n      status\n      inviteExpiresAt\n    }\n  }\n",
): (typeof documents)["\n  query getWorkspaceMemberByTokenFromInviteRoute($token: String!) {\n    workspaceMemberByToken(token: $token) {\n      id\n      name\n      email\n      role\n      status\n      inviteExpiresAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation acceptWorkspaceInviteFromInviteRoute(\n    $token: String!\n    $input: AcceptWorkspaceInviteInput\n  ) {\n    acceptWorkspaceInvite(token: $token, input: $input) {\n      workspaceMember {\n        id\n        name\n        role\n      }\n      workspaceId\n    }\n  }\n",
): (typeof documents)["\n  mutation acceptWorkspaceInviteFromInviteRoute(\n    $token: String!\n    $input: AcceptWorkspaceInviteInput\n  ) {\n    acceptWorkspaceInvite(token: $token, input: $input) {\n      workspaceMember {\n        id\n        name\n        role\n      }\n      workspaceId\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
