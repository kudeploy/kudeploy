{{/*
Return the chart fullname from the common library.
*/}}
{{- define "kudeploy-controller.fullname" -}}
{{- include "common.names.fullname" . -}}
{{- end -}}

{{/*
Return the release namespace from the common library.
*/}}
{{- define "kudeploy-controller.namespace" -}}
{{- include "common.names.namespace" . -}}
{{- end -}}

{{/*
Standard labels shared by all resources.
*/}}
{{- define "kudeploy-controller.labels" -}}
{{ include "common.labels.standard" (dict "customLabels" .Values.commonLabels "context" .) }}
app.kubernetes.io/component: controller
{{- end -}}

{{/*
Immutable labels used in selectors.
*/}}
{{- define "kudeploy-controller.selectorLabels" -}}
{{ include "common.labels.matchLabels" (dict "customLabels" .Values.podLabels "context" .) }}
app.kubernetes.io/component: controller
{{- end -}}

{{/*
Resolve the service account name.
*/}}
{{- define "kudeploy-controller.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "kudeploy-controller.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- required "serviceAccount.name is required when serviceAccount.create is false" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{/*
Resolve the controller image reference.
*/}}
{{- define "kudeploy-controller.image" -}}
{{- $registry := default .Values.image.registry .Values.global.imageRegistry -}}
{{- $repository := .Values.image.repository -}}
{{- $image := ternary (printf "%s/%s" $registry $repository) $repository (ne $registry "") -}}
{{- if .Values.image.digest -}}
{{- printf "%s@%s" $image .Values.image.digest -}}
{{- else -}}
{{- printf "%s:%s" $image (default .Chart.AppVersion .Values.image.tag) -}}
{{- end -}}
{{- end -}}
