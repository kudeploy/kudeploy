{{/*
Return the chart fullname from the common library.
*/}}
{{- define "kudeploy.fullname" -}}
{{- include "common.names.fullname" . -}}
{{- end -}}

{{/*
Return the release namespace from the common library.
*/}}
{{- define "kudeploy.namespace" -}}
{{- include "common.names.namespace" . -}}
{{- end -}}

{{/*
Standard labels shared by all resources.
*/}}
{{- define "kudeploy.labels" -}}
{{ include "common.labels.standard" (dict "customLabels" .Values.commonLabels "context" .) }}
app.kubernetes.io/component: controller
{{- end -}}

{{/*
Immutable labels used in selectors.
*/}}
{{- define "kudeploy.selectorLabels" -}}
{{ include "common.labels.matchLabels" (dict "customLabels" .Values.podLabels "context" .) }}
app.kubernetes.io/component: controller
{{- end -}}

{{/*
Resolve the service account name.
*/}}
{{- define "kudeploy.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "kudeploy.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- required "serviceAccount.name is required when serviceAccount.create is false" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{/*
Resolve the controller image reference.
*/}}
{{- define "kudeploy.image" -}}
{{- include "common.images.image" (dict "imageRoot" .Values.image "global" .Values.global "chart" .Chart) -}}
{{- end -}}
