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
	"fmt"
	"reflect"
	"strings"

	corev1 "k8s.io/api/core/v1"
)

const unsupportedVolumeSourceReason = "UnsupportedVolumeSource"

func validatePVCVolumeSources(volumes []corev1.Volume) error {
	for _, volume := range volumes {
		if source := unsupportedVolumeSourceField(volume.VolumeSource); source != "" {
			return fmt.Errorf("volume %q uses unsupported %s source; only persistentVolumeClaim is supported", volume.Name, source)
		}
		if volume.PersistentVolumeClaim == nil {
			return fmt.Errorf("volume %q must use persistentVolumeClaim", volume.Name)
		}
	}
	return nil
}

func unsupportedVolumeSourceField(source corev1.VolumeSource) string {
	value := reflect.ValueOf(source)
	typ := value.Type()
	for index := 0; index < value.NumField(); index++ {
		field := typ.Field(index)
		if value.Field(index).IsZero() || field.Name == "PersistentVolumeClaim" {
			continue
		}
		return lowerInitial(field.Name)
	}
	return ""
}

func lowerInitial(value string) string {
	if value == "" {
		return value
	}
	return strings.ToLower(value[:1]) + value[1:]
}
