{{/*
Return the chart fullname from the common library.
*/}}
{{- define "kudeploy-client.fullname" -}}
{{- include "common.names.fullname" . -}}
{{- end -}}

{{/*
Return the release namespace from the common library.
*/}}
{{- define "kudeploy-client.namespace" -}}
{{- include "common.names.namespace" . -}}
{{- end -}}

{{/*
Standard labels shared by all resources.
*/}}
{{- define "kudeploy-client.labels" -}}
{{ include "common.labels.standard" (dict "customLabels" .Values.commonLabels "context" .) }}
app.kubernetes.io/component: client
{{- end -}}

{{/*
Immutable labels used in selectors.
*/}}
{{- define "kudeploy-client.selectorLabels" -}}
{{ include "common.labels.matchLabels" (dict "customLabels" .Values.podLabels "context" .) }}
app.kubernetes.io/component: client
{{- end -}}

{{/*
Resolve the service account name.
*/}}
{{- define "kudeploy-client.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "kudeploy-client.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- required "serviceAccount.name is required when serviceAccount.create is false" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{/*
Resolve the client image reference.
*/}}
{{- define "kudeploy-client.image" -}}
{{- $registry := default .Values.image.registry .Values.global.imageRegistry -}}
{{- $repository := .Values.image.repository -}}
{{- $image := ternary (printf "%s/%s" $registry $repository) $repository (ne $registry "") -}}
{{- if .Values.image.digest -}}
{{- printf "%s@%s" $image .Values.image.digest -}}
{{- else -}}
{{- printf "%s:%s" $image (default .Chart.AppVersion .Values.image.tag) -}}
{{- end -}}
{{- end -}}
