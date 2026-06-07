{{/*
Return the chart fullname.
*/}}
{{- define "kudeploy.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Return the release namespace.
*/}}
{{- define "kudeploy.namespace" -}}
{{- default .Release.Namespace .Values.namespaceOverride -}}
{{- end -}}

{{/*
Standard labels shared by chart-level resources.
*/}}
{{- define "kudeploy.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ default .Chart.Name .Values.nameOverride }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{/*
Client helpers.
*/}}
{{- define "kudeploy.client.fullname" -}}
{{- if .Values.client.fullnameOverride -}}
{{- .Values.client.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (default "client" .Values.client.nameOverride) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.client.namespace" -}}
{{- default (include "kudeploy.namespace" .) .Values.client.namespaceOverride -}}
{{- end -}}

{{- define "kudeploy.client.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ default "client" .Values.client.nameOverride }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: client
{{- with .Values.client.image.tag }}
app.kubernetes.io/version: {{ . | quote }}
{{- end }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- with .Values.client.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{- define "kudeploy.client.selectorLabels" -}}
app.kubernetes.io/name: {{ default "client" .Values.client.nameOverride }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: client
{{- end -}}

{{- define "kudeploy.client.serviceAccountName" -}}
{{- if .Values.client.serviceAccount.create -}}
{{- default (include "kudeploy.client.fullname" .) .Values.client.serviceAccount.name -}}
{{- else -}}
{{- required "client.serviceAccount.name is required when client.serviceAccount.create is false" .Values.client.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.client.image" -}}
{{- $registry := default .Values.client.image.registry .Values.global.imageRegistry -}}
{{- $repository := .Values.client.image.repository -}}
{{- $image := ternary (printf "%s/%s" $registry $repository) $repository (ne $registry "") -}}
{{- if .Values.client.image.digest -}}
{{- printf "%s@%s" $image .Values.client.image.digest -}}
{{- else -}}
{{- printf "%s:%s" $image (required "client.image.tag is required" .Values.client.image.tag) -}}
{{- end -}}
{{- end -}}

{{/*
Controller helpers.
*/}}
{{- define "kudeploy.controller.fullname" -}}
{{- if .Values.controller.fullnameOverride -}}
{{- .Values.controller.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (default "controller" .Values.controller.nameOverride) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.controller.namespace" -}}
{{- default (include "kudeploy.namespace" .) .Values.controller.namespaceOverride -}}
{{- end -}}

{{- define "kudeploy.controller.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ default "controller" .Values.controller.nameOverride }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: controller
{{- with .Values.controller.image.tag }}
app.kubernetes.io/version: {{ . | quote }}
{{- end }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- with .Values.controller.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{- define "kudeploy.controller.selectorLabels" -}}
app.kubernetes.io/name: {{ default "controller" .Values.controller.nameOverride }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: controller
{{- end -}}

{{- define "kudeploy.controller.serviceAccountName" -}}
{{- if .Values.controller.serviceAccount.create -}}
{{- default (include "kudeploy.controller.fullname" .) .Values.controller.serviceAccount.name -}}
{{- else -}}
{{- required "controller.serviceAccount.name is required when controller.serviceAccount.create is false" .Values.controller.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.controller.image" -}}
{{- $registry := default .Values.controller.image.registry .Values.global.imageRegistry -}}
{{- $repository := .Values.controller.image.repository -}}
{{- $image := ternary (printf "%s/%s" $registry $repository) $repository (ne $registry "") -}}
{{- if .Values.controller.image.digest -}}
{{- printf "%s@%s" $image .Values.controller.image.digest -}}
{{- else -}}
{{- printf "%s:%s" $image (required "controller.image.tag is required" .Values.controller.image.tag) -}}
{{- end -}}
{{- end -}}

{{/*
Server helpers.
*/}}
{{- define "kudeploy.server.fullname" -}}
{{- if .Values.server.fullnameOverride -}}
{{- .Values.server.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (default "server" .Values.server.nameOverride) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.server.namespace" -}}
{{- default (include "kudeploy.namespace" .) .Values.server.namespaceOverride -}}
{{- end -}}

{{- define "kudeploy.server.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ default "server" .Values.server.nameOverride }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: server
{{- with .Values.server.image.tag }}
app.kubernetes.io/version: {{ . | quote }}
{{- end }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- with .Values.server.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{- define "kudeploy.server.selectorLabels" -}}
app.kubernetes.io/name: {{ default "server" .Values.server.nameOverride }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: server
{{- end -}}

{{- define "kudeploy.server.migration.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ default "server" .Values.server.nameOverride }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: server-migration
{{- with .Values.server.image.tag }}
app.kubernetes.io/version: {{ . | quote }}
{{- end }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- with .Values.server.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{- define "kudeploy.server.migration.selectorLabels" -}}
app.kubernetes.io/name: {{ default "server" .Values.server.nameOverride }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: server-migration
{{- end -}}

{{- define "kudeploy.server.serviceAccountName" -}}
{{- if .Values.server.serviceAccount.create -}}
{{- default (include "kudeploy.server.fullname" .) .Values.server.serviceAccount.name -}}
{{- else -}}
{{- required "server.serviceAccount.name is required when server.serviceAccount.create is false" .Values.server.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.server.image" -}}
{{- $registry := default .Values.server.image.registry .Values.global.imageRegistry -}}
{{- $repository := .Values.server.image.repository -}}
{{- $image := ternary (printf "%s/%s" $registry $repository) $repository (ne $registry "") -}}
{{- if .Values.server.image.digest -}}
{{- printf "%s@%s" $image .Values.server.image.digest -}}
{{- else -}}
{{- printf "%s:%s" $image (required "server.image.tag is required" .Values.server.image.tag) -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.server.appUrl" -}}
{{- if .Values.server.appUrl -}}
{{- tpl .Values.server.appUrl . -}}
{{- else if .Values.ingress.enabled -}}
{{- $host := tpl .Values.ingress.hostname . -}}
{{- if $host -}}
{{- $scheme := ternary "https" "http" .Values.ingress.tls -}}
{{- printf "%s://%s" $scheme $host -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.server.env" -}}
{{- $values := .Values.server -}}
- name: PORT
  value: {{ $values.port | quote }}
- name: APP_SECRET
  valueFrom:
    secretKeyRef:
      name: {{ include "kudeploy.server.secretName" . }}
      key: app-secret
{{- $appUrl := include "kudeploy.server.appUrl" . }}
{{- if $appUrl }}
- name: APP_URL
  value: {{ $appUrl | quote }}
{{- end }}
{{- $postgresqlEnabled := .Values.postgresql.enabled }}
{{- $externalDatabaseEnabled := and (not $postgresqlEnabled) .Values.externalDatabase.host }}
{{- if or $postgresqlEnabled $externalDatabaseEnabled }}
{{- $databaseHost := ternary (include "kudeploy.server.postgresql.fullname" .) .Values.externalDatabase.host $postgresqlEnabled }}
{{- $databasePort := ternary (default .Values.postgresql.service.ports.postgresql .Values.global.postgresql.service.ports.postgresql) .Values.externalDatabase.port $postgresqlEnabled }}
{{- $databaseUser := ternary (default .Values.postgresql.auth.username .Values.global.postgresql.auth.username) .Values.externalDatabase.user $postgresqlEnabled }}
{{- $databaseName := ternary (default .Values.postgresql.auth.database .Values.global.postgresql.auth.database) .Values.externalDatabase.database $postgresqlEnabled }}
{{- $databaseSecretName := ternary (include "kudeploy.server.postgresql.secretName" .) .Values.externalDatabase.existingSecret $postgresqlEnabled }}
{{- $databasePasswordKey := ternary (default .Values.postgresql.auth.existingSecretPasswordKey .Values.global.postgresql.auth.existingSecretPasswordKey) .Values.externalDatabase.existingSecretPasswordKey $postgresqlEnabled }}
{{- $databasePassword := ternary "" .Values.externalDatabase.password $postgresqlEnabled }}
{{- if or $databaseSecretName $databasePassword }}
- name: KUDEPLOY_SERVER_POSTGRESQL_PASSWORD
  {{- if $databaseSecretName }}
  valueFrom:
    secretKeyRef:
      name: {{ $databaseSecretName }}
      key: {{ $databasePasswordKey }}
  {{- else }}
  value: {{ $databasePassword | quote }}
  {{- end }}
{{- end }}
- name: DATABASE_URL
  {{- if or $databaseSecretName $databasePassword }}
  value: {{ printf "postgresql://%s:$(KUDEPLOY_SERVER_POSTGRESQL_PASSWORD)@%s:%v/%s" $databaseUser $databaseHost $databasePort $databaseName | quote }}
  {{- else }}
  value: {{ printf "postgresql://%s@%s:%v/%s" $databaseUser $databaseHost $databasePort $databaseName | quote }}
  {{- end }}
{{- end }}
{{- $valkeyEnabled := .Values.valkey.enabled }}
{{- $externalValkeyEnabled := and (not $valkeyEnabled) .Values.externalValkey.host }}
{{- if or $valkeyEnabled $externalValkeyEnabled }}
{{- $valkeyHost := ternary (include "kudeploy.server.valkey.fullname" .) .Values.externalValkey.host $valkeyEnabled }}
{{- $valkeyPort := ternary .Values.valkey.service.ports.valkey .Values.externalValkey.port $valkeyEnabled }}
{{- $valkeySecretName := ternary (include "kudeploy.server.valkey.secretName" .) .Values.externalValkey.existingSecret $valkeyEnabled }}
{{- $valkeyPasswordKey := ternary .Values.valkey.auth.existingSecretPasswordKey .Values.externalValkey.existingSecretPasswordKey $valkeyEnabled }}
{{- $valkeyPassword := ternary "" .Values.externalValkey.password $valkeyEnabled }}
{{- $valkeyAuthEnabled := ternary .Values.valkey.auth.enabled (or .Values.externalValkey.existingSecret .Values.externalValkey.password) $valkeyEnabled }}
{{- if $valkeyAuthEnabled }}
- name: KUDEPLOY_SERVER_VALKEY_PASSWORD
  {{- if $valkeySecretName }}
  valueFrom:
    secretKeyRef:
      name: {{ $valkeySecretName }}
      key: {{ $valkeyPasswordKey }}
  {{- else }}
  value: {{ $valkeyPassword | quote }}
  {{- end }}
- name: REDIS_URL
  value: {{ printf "redis://:$(KUDEPLOY_SERVER_VALKEY_PASSWORD)@%s:%v" $valkeyHost $valkeyPort | quote }}
{{- else }}
- name: REDIS_URL
  value: {{ printf "redis://%s:%v" $valkeyHost $valkeyPort | quote }}
{{- end }}
{{- end }}
{{- with $values.extraEnv }}
{{- include "common.tplvalues.render" (dict "value" . "context" $) }}
{{- end }}
{{- end -}}

{{- define "kudeploy.server.envFrom" -}}
{{- with .Values.server.envFrom }}
{{- include "common.tplvalues.render" (dict "value" . "context" $) }}
{{- end }}
{{- end -}}

{{- define "kudeploy.server.secretName" -}}
{{- if .Values.server.existingSecret -}}
{{- .Values.server.existingSecret -}}
{{- else -}}
{{- include "kudeploy.server.fullname" . -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.server.appSecret" -}}
{{- $secretValue := "" -}}
{{- if not $secretValue -}}
{{- $secretName := include "kudeploy.server.secretName" . -}}
{{- $existing := lookup "v1" "Secret" (include "kudeploy.server.namespace" .) $secretName -}}
{{- if and $existing (hasKey $existing.data "app-secret") -}}
{{- $secretValue = (index $existing.data "app-secret" | b64dec) -}}
{{- else if and $existing (hasKey $existing.data "APP_SECRET") -}}
{{- $secretValue = (index $existing.data "APP_SECRET" | b64dec) -}}
{{- else -}}
{{- $secretValue = randAlphaNum 64 -}}
{{- end -}}
{{- end -}}
{{- $secretValue -}}
{{- end -}}

{{- define "kudeploy.server.postgresql.fullname" -}}
{{- if .Values.postgresql.fullnameOverride -}}
{{- .Values.postgresql.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else if .Values.global.postgresql.fullnameOverride -}}
{{- .Values.global.postgresql.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-postgresql" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.server.postgresql.secretName" -}}
{{- if .Values.postgresql.auth.existingSecret -}}
{{- .Values.postgresql.auth.existingSecret -}}
{{- else if .Values.global.postgresql.auth.existingSecret -}}
{{- .Values.global.postgresql.auth.existingSecret -}}
{{- else -}}
{{- include "kudeploy.server.postgresql.fullname" . -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.server.valkey.fullname" -}}
{{- if .Values.valkey.fullnameOverride -}}
{{- .Values.valkey.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-valkey" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "kudeploy.server.valkey.secretName" -}}
{{- if .Values.valkey.auth.existingSecret -}}
{{- .Values.valkey.auth.existingSecret -}}
{{- else -}}
{{- include "kudeploy.server.valkey.fullname" . -}}
{{- end -}}
{{- end -}}

{{/*
Ingress service name helpers.
*/}}
{{- define "kudeploy.clientServiceName" -}}
{{- default (include "kudeploy.client.fullname" .) .Values.ingress.client.serviceName -}}
{{- end -}}

{{- define "kudeploy.serverServiceName" -}}
{{- default (include "kudeploy.server.fullname" .) .Values.ingress.server.serviceName -}}
{{- end -}}
