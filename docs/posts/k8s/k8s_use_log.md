---
icon: book
date: 2022-05-18
category:
  - k8s
tag:
  - k8s
---


# k8s常用命令

## kubectl命令

命令|注释
---|---
kubectl get pods -o wide -A|获取所有节点pod,-o wide(显示更多),-A(显示所有命名空间)
kubectl get svc -o wide -A|获取服务
kubectl get ns|获取命名空间

