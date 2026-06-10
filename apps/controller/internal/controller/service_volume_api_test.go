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
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"

	kudeployv1alpha1 "github.com/kudeploy/kudeploy-controller/api/v1alpha1"
)

var _ = Describe("ServiceVolume API validation", func() {
	var namespace *corev1.Namespace

	BeforeEach(func() {
		namespace = &corev1.Namespace{
			ObjectMeta: metav1.ObjectMeta{GenerateName: "service-volume-api-"},
		}
		Expect(k8sClient.Create(ctx, namespace)).To(Succeed())
		DeferCleanup(func() {
			Expect(client.IgnoreNotFound(k8sClient.Delete(ctx, namespace))).To(Succeed())
		})
	})

	It("admits name-only Service volumes with at most one replica", func() {
		service := &kudeployv1alpha1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "volume-service",
				Namespace: namespace.Name,
			},
			Spec: kudeployv1alpha1.ServiceSpec{
				Replicas: ptrInt32(1),
				Image:    "ghcr.io/kudeploy/whoami:latest",
				Ports:    []kudeployv1alpha1.ServicePort{{Port: 80}},
				Volumes: []kudeployv1alpha1.ServiceVolume{
					{Name: "kd-volume-data", MountPath: "/data"},
				},
			},
		}

		Expect(k8sClient.Create(ctx, service)).To(Succeed())
	})

	It("admits Services with the maximum replica count", func() {
		service := &kudeployv1alpha1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "max-replica-service",
				Namespace: namespace.Name,
			},
			Spec: kudeployv1alpha1.ServiceSpec{
				Replicas: ptrInt32(100),
				Image:    "ghcr.io/kudeploy/whoami:latest",
				Ports:    []kudeployv1alpha1.ServicePort{{Port: 80}},
			},
		}

		Expect(k8sClient.Create(ctx, service)).To(Succeed())
	})

	It("rejects Services above the maximum replica count", func() {
		service := &kudeployv1alpha1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "too-many-replica-service",
				Namespace: namespace.Name,
			},
			Spec: kudeployv1alpha1.ServiceSpec{
				Replicas: ptrInt32(101),
				Image:    "ghcr.io/kudeploy/whoami:latest",
				Ports:    []kudeployv1alpha1.ServicePort{{Port: 80}},
			},
		}

		err := k8sClient.Create(ctx, service)

		Expect(apierrors.IsInvalid(err)).To(BeTrue(), "expected invalid error, got %v", err)
		Expect(err.Error()).To(ContainSubstring("less than or equal to 100"))
	})

	It("rejects Service volumes with more than one replica", func() {
		service := &kudeployv1alpha1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "volume-service",
				Namespace: namespace.Name,
			},
			Spec: kudeployv1alpha1.ServiceSpec{
				Replicas: ptrInt32(2),
				Image:    "ghcr.io/kudeploy/whoami:latest",
				Ports:    []kudeployv1alpha1.ServicePort{{Port: 80}},
				Volumes: []kudeployv1alpha1.ServiceVolume{
					{Name: "kd-volume-data", MountPath: "/data"},
				},
			},
		}

		err := k8sClient.Create(ctx, service)

		Expect(apierrors.IsInvalid(err)).To(BeTrue(), "expected invalid error, got %v", err)
		Expect(err.Error()).To(ContainSubstring("replicas must be 0 or 1 when volumes are configured"))
	})

	It("rejects Kudeploy Deployment volumes with more than one replica", func() {
		deployment := &kudeployv1alpha1.Deployment{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "volume-deployment",
				Namespace: namespace.Name,
			},
			Spec: kudeployv1alpha1.DeploymentSpec{
				ServiceName:        "volume-service",
				Version:            1,
				ServiceAccountName: "service-volume-service",
				Replicas:           ptrInt32(2),
				Image:              "ghcr.io/kudeploy/whoami:latest",
				Ports:              []kudeployv1alpha1.ServicePort{{Port: 80}},
				Volumes: []kudeployv1alpha1.ServiceVolume{
					{Name: "kd-volume-data", MountPath: "/data"},
				},
			},
		}

		err := k8sClient.Create(ctx, deployment)

		Expect(apierrors.IsInvalid(err)).To(BeTrue(), "expected invalid error, got %v", err)
		Expect(err.Error()).To(ContainSubstring("replicas must be 0 or 1 when volumes are configured"))
	})

	It("admits Kudeploy Deployments with the maximum replica count", func() {
		deployment := &kudeployv1alpha1.Deployment{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "max-replica-deployment",
				Namespace: namespace.Name,
			},
			Spec: kudeployv1alpha1.DeploymentSpec{
				ServiceName:        "max-replica-service",
				Version:            1,
				ServiceAccountName: "service-max-replica-service",
				Replicas:           ptrInt32(100),
				Image:              "ghcr.io/kudeploy/whoami:latest",
				Ports:              []kudeployv1alpha1.ServicePort{{Port: 80}},
			},
		}

		Expect(k8sClient.Create(ctx, deployment)).To(Succeed())
	})

	It("rejects Kudeploy Deployments above the maximum replica count", func() {
		deployment := &kudeployv1alpha1.Deployment{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "too-many-replica-deployment",
				Namespace: namespace.Name,
			},
			Spec: kudeployv1alpha1.DeploymentSpec{
				ServiceName:        "too-many-replica-service",
				Version:            1,
				ServiceAccountName: "service-too-many-replica-service",
				Replicas:           ptrInt32(101),
				Image:              "ghcr.io/kudeploy/whoami:latest",
				Ports:              []kudeployv1alpha1.ServicePort{{Port: 80}},
			},
		}

		err := k8sClient.Create(ctx, deployment)

		Expect(apierrors.IsInvalid(err)).To(BeTrue(), "expected invalid error, got %v", err)
		Expect(err.Error()).To(ContainSubstring("less than or equal to 100"))
	})
})
