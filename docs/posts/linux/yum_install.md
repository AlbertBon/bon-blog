---
icon: edit
date: 2022-05-17
category:
  - linux
tag:
  - linux
---

# yum 安装

> 不小心删掉了yum,重装的时候遇到了太多坑,记录一下成功的案例

## 彻底卸载原有文件

1. 删除python

```shell script
##强制清除已安装的程序及其关联
rpm -qa|grep python|xargs rpm -ev –allmatches –nodeps 
##删除所有残余文件 ##xargs，允许你对输出执行其他某些命令
whereis python |xargs rm -frv 
##验证删除，返回无结果说明清除干净
whereis python 
```

2. 删除yum

```shell script
rpm -qa|grep yum|xargs rpm -ev –allmatches –nodeps

whereis yum |xargs rm -frv
```

## 安装

1. 检查centos版本

```shell script
cat /etc/centos-release

[root@localhost download]# cat /etc/centos-release
CentOS Linux release 7.8.2003 (Core)
```

2. 下载文件

> 可以新建一个目录来放下载的文件,这些文件后面可以删掉 `mkdir /home/download` `cd /home/download`

```shell script
wget https://vault.centos.org/7.2.1511/os/x86_64/Packages/python-2.7.5-34.el7.x86_64.rpm
wget https://vault.centos.org/7.2.1511/os/x86_64/Packages/python-iniparse-0.4-9.el7.noarch.rpm
wget https://vault.centos.org/7.2.1511/os/x86_64/Packages/python-pycurl-7.19.0-17.el7.x86_64.rpm
wget https://vault.centos.org/7.2.1511/os/x86_64/Packages/python-urlgrabber-3.10-7.el7.noarch.rpm
wget https://vault.centos.org/7.2.1511/os/x86_64/Packages/rpm-python-4.11.3-17.el7.x86_64.rpm
wget https://vault.centos.org/7.2.1511/os/x86_64/Packages/python-libs-2.7.5-34.el7.x86_64.rpm
wget https://vault.centos.org/7.2.1511/os/x86_64/Packages/yum-3.4.3-132.el7.centos.0.1.noarch.rpm
wget https://vault.centos.org/7.2.1511/os/x86_64/Packages/yum-metadata-parser-1.1.4-10.el7.x86_64.rpm
wget https://vault.centos.org/7.2.1511/os/x86_64/Packages/yum-plugin-fastestmirror-1.1.31-34.el7.noarch.rpm
```

3. 安装

```shell script
rpm -Uvh --replacepkgs python*.rpm
rpm -Uvh --replacepkgs rpm-python*.rpm yum*.rpm --nodeps --force
```

4. 验证

```shell script
python -v

yum
```

