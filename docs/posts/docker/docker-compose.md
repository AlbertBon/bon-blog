---
icon: edit
date: 2022-05-17
category:
  - docker
tag:
  - docker
---

# docker-compose 

## yum安装
### yum安装docker compose `已成功的方式`

> [yum相关](../linux/yum_install.md)

1. 下载

```shell script
curl -L https://get.daocloud.io/docker/compose/releases/download/1.25.4/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```

2. 修改权限

```shell script
chmod +x /usr/local/bin/docker-compose
```

3. 验证

```shell script
docker-compose -version
```

### yum安装docker compose `暂未成功的方式`

1. 添加EPEL源

```shell script
yum install -y epel-release
```

2. 安装python-pip

```shell script
yum install -y python-pip
```

3. 通过pip安装docker-compose

```shell script
pip install docker-compose
```

4. 可能会需要更新pip

> 遇到更新报错:You should consider upgrading via the 'pip install --upgrade pip' command.

```shell script
pip install --upgrade pip
```

## compose使用

### 命令选项

命令|含义
---|---
-f| --file FILE 指定使用的 Compose 模板文件，默认为 docker-compose.yml，可以多次指定。
-p| --project-name NAME 指定项目名称，默认将使用所在目录名称作为项目名。
–x-networking| 使用 Docker 的可拔插网络后端特性
–x-network-driver| DRIVER 指定网络后端的驱动，默认为 bridge
–verbose| 输出更多调试信息。
-v| --version 打印版本并退出。

### compose 启动命令

* config

> config验证 Compose 文件格式是否正确，若正确则显示配置，若格式错误显示错误原因。
> 如：`docker-compose -f mysql-nacos.yaml config` 此命令不会执行真正的操作，而是显示 docker-compose 程序解析到的配置文件内容

* images

> images列出 Compose 文件中包含的镜像。 `ocker-compose -f mysql-nacos.yml images`

* ps

> ps列出项目中目前的所有容器。 docker-compose -f mysql-nacos.yaml ps

* build 

> build构建（重新构建）项目中的服务容器。
> 如：`docker-compose -f mysql-nacos.yaml build` ，一般搭配自定义镜像，比如编写的Dockfile，功能类似于docker build .

* up

> up该命令十分强大（重点掌握），它将尝试自动完成包括构建镜像，（重新）创建服务，启动服务，并关联服务相关容器的一系列操作。
> 如: `docker-compose -f mysql-nacos.yml up` 默认情况，docker-compose up 启动的容器都在前台，控制台将会同时打印所有容器的输出信息，可以很方便进行调试。

* up -d

> 与up相比是后台启动,不会再前台打印启动信息

* down

> down此命令停止用up命令所启动的容器并移除网络，如 `docker-compose -f mysql-nacos.yml down`

* stop

> stop格式为 docker-compose stop [options] [SERVICE...]停止已经处于运行状态的容器，但不删除它。通过 docker-compose start 可以再次启动这些容器，如果不指定service则默认停止所有的容器。
> 如 `docker-compose -f mysql-nacos.yml stop nacos` 选项：-t, --timeout TIMEOUT 停止容器时候的超时（默认为 10 秒）。

* start 

> start启动已经存在的服务容器。用法跟上面的stop刚好相反
> 如 `docker-compose -f mysql-nacos.yml start nacos`

* restart

> 重启

* logs

> logs格式为 `docker-compose logs [options] [SERVICE...]` 查看服务容器的输出。
> 默认情况下，docker-compose 将对不同的服务输出使用不同的颜色来区分。可以通过 --no-color 来关闭颜色。该命令在调试问题的时候十分有用。
> 如 `docker-compose -f mysql-nacos.yml logs` 查看整体的日志
> `docker-compose -f mysql-nacos.yml logs nacos` 查看单独容器的日志

### compose 模板命令

```yaml
# images指定为镜像名称或镜像 ID。如果镜像在本地不存在，Compose 将会尝试拉取这个镜像。
image: mysql:5.7

# ports暴露端口信息。使用宿主端口：容器端口 (HOST:CONTAINER) 格式，或者仅仅指定容器的端口（宿主将会随机选择端口）都可以，端口字符串都使用引号包括起来的字符串格式。
ports: 
    - "3000" 
    - "8080:8080" 
    - "127.0.0.1:8001:8001"

# volumes数据卷所挂载路径设置。可以设置为宿主机路径(HOST:CONTAINER)或者数据卷名称(VOLUME:CONTAINER)，并且可以设置访问模式 （HOST:CONTAINER:ro）。
volumes: 
    - /docker/mysql/data:/var/lib/mysql

# ulimits指定容器的 ulimits 限制值。例如，指定最大进程数为 65535，指定文件句柄数为 20000（软限制，应用可以随时修改，不能超过硬限制） 和 40000（系统硬限制，只能 root 用户提高）。
ulimits: 
  nproc: 65535 
  nofile: 
    soft: 20000 
    hard: 40000

# depends_on解决容器的依赖、启动先后的问题。以下例子中会先启动 redis mysql 再启动 web

# environment设置环境变量。你可以使用数组或字典两种格式。

# restart指定容器退出后的重启策略为始终重启。该命令对保持服务始终运行十分有效，在生产环境中推荐配置为 always 或者 unless-stopped。
```

## compose文件

* [mysql-nacos.yaml](./compose/mysql-nacos.yaml)
