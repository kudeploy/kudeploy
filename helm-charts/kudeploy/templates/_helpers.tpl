{{/*
Return the aggregate chart fullname.
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
Standard labels shared by aggregate chart resources.
*/}}
{{- define "kudeploy.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ default .Chart.Name .Values.nameOverride }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Chart.AppVersion }}
app.kubernetes.io/version: {{ . | quote }}
{{- end }}
{{- end -}}

{{/*
Resolve the client service name exposed by the aliased dependency chart.
*/}}
{{- define "kudeploy.clientServiceName" -}}
{{- default (printf "%s-client" .Release.Name) .Values.ingress.client.serviceName -}}
{{- end -}}

{{/*
Resolve the server service name exposed by the aliased dependency chart.
*/}}
{{- define "kudeploy.serverServiceName" -}}
{{- default (printf "%s-server" .Release.Name) .Values.ingress.server.serviceName -}}
{{- end -}}
