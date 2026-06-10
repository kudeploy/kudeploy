/*
Copyright 2026.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controller

import (
	"context"

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func namespaceWorkspaceID(ctx context.Context, reader client.Reader, namespaceName string, fallbackLabels map[string]string) (string, error) {
	namespace := &corev1.Namespace{}
	if err := reader.Get(ctx, client.ObjectKey{Name: namespaceName}, namespace); err != nil {
		if apierrors.IsNotFound(err) {
			return workspaceFromLabels(fallbackLabels), nil
		}
		return "", err
	}
	return workspaceFromLabels(namespace.Labels), nil
}

func workspaceFromLabels(labels map[string]string) string {
	if labels == nil {
		return ""
	}
	return labels[workspaceLabel]
}

func syncWorkspaceLabel(labels map[string]string, workspaceID string) bool {
	if workspaceID == "" {
		if _, ok := labels[workspaceLabel]; ok {
			delete(labels, workspaceLabel)
			return true
		}
		return false
	}
	if labels[workspaceLabel] == workspaceID {
		return false
	}
	labels[workspaceLabel] = workspaceID
	return true
}

func addWorkspaceLabel(labels map[string]string, workspaceID string) map[string]string {
	if workspaceID == "" {
		return labels
	}
	if labels == nil {
		labels = map[string]string{}
	}
	labels[workspaceLabel] = workspaceID
	return labels
}
