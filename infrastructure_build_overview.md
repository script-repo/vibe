# Infrastructure Build Overview

## Introduction

This document summarises the steps required to build a production‑ready infrastructure on **Nutanix** using **Acropolis Hypervisor (AHV)** and the **Acropolis Operating System (AOS)** for virtualization and storage.  Management is provided through **Prism Central**, and Kubernetes workloads run on **Nutanix Kubernetes Platform (NKP)** with persistent storage from **Nutanix Volumes**.  All virtual machines (VMs) and container hosts use **Ubuntu 22.04 LTS** as their base operating system.

The goal is to deploy a resilient environment that can host modern applications, databases and services on top of a scalable Kubernetes cluster while remaining flexible enough to support additional workloads.  The overview below layers the steps logically; each layer depends on the previous one.

## Pre‑requisites and Assumptions

* **Hardware / network:**  A Nutanix‑ready server environment capable of running AHV.  Each node requires at least three disks – one for the hypervisor, one SSD for the **Controller VM (CVM)** and one for data storage – as recommended in community guidance【599562328817921†L156-L160】.  Plan IP addresses ahead of time; a single‑node cluster needs at least five IPv4 addresses (host, CVM, cluster virtual IP, data services VIP and Prism Central)【599562328817921†L175-L191】.
* **Nutanix licences:**  Access to the Nutanix portal (a **Nutanix Next** account) to download installation media【599562328817921†L108-L130】 and obtain the NKP binary and node images【900619056792212†L189-L240】.
* **Management host:**  A VM (jump host) running Ubuntu 22.04 to perform installations and run the NKP CLI.  A small deployment machine with 2 vCPUs, 6 GiB of RAM and ~150 GB of disk is sufficient【472257869343838†L195-L200】.
* **Networking:**  DNS records for all cluster components, NTP servers and outbound connectivity to the Nutanix portal and container registries.
* **Security:**  All servers should be hardened before hosting services.  Keeping the system up to date (`apt‑get update && apt‑get upgrade`) and limiting root access are fundamental practices【841446552574758†L159-L175】【841446552574758†L177-L210】.

## Layer 1 – Install AHV and AOS on physical hosts

1. **Prepare installation media:**  Download the Phoenix ISO (AHV installer) from the Nutanix portal.  Use a USB tool such as Rufus and ensure the USB stick is labelled `PHOENIX` because the installer searches for that label【599562328817921†L134-L145】.
2. **Boot each node:**  Boot each physical host from the USB and install AHV.  The installer will prompt for disk selection and basic network settings.  Do not select the “Create single‑node cluster” option during installation – it is easier to create the cluster after installation【599562328817921†L214-L218】.
3. **Assign networking:**  Configure static IPs for the hypervisor host and the CVM.  Reserve additional addresses for the cluster VIP, data services VIP and Prism Central【599562328817921†L175-L191】.
4. **Repeat** for all nodes.  After installation, each node boots into AHV and a CVM running AOS.

## Layer 2 – Create the Nutanix cluster

1. **SSH to a CVM** using default credentials (`nutanix` / `nutanix/4u`).
2. **Create the cluster:**  Use the `cluster` command to join CVMs and form a cluster.  For example:

   ```bash
   cluster --cluster_name=<cluster_name> \
     --redundancy_factor=2 \
     --cluster_external_ip=<VIP> \
     --dns_servers=<dns1>,<dns2> \
     --ntp_servers=<ntp1>,<ntp2> \
     --svm_ips=<cvm1_ip>,<cvm2_ip>,<cvm3_ip> create
   ```

   The `cluster` command aggregates the CVMs and assigns a redundancy factor (typically 2).  A community guide shows a similar command to create the cluster【760386158276113†L37-L45】.
3. **Set timezone (optional):**  Use `ncli cluster set-timezone` to configure the cluster timezone.
4. **Verify cluster health** using `cluster status` and `ncli cluster info`.

## Layer 3 – Deploy Prism Central and configure AOS

1. **Access Prism Element:**  From a browser, connect to any CVM at `https://<cvm_ip>:9440` and log in using the default admin credentials.  Change the admin password during first login.
2. **Download Prism Central bundle:**  In Prism Element, select **Settings → Prism Central Registration**, then upload the Prism Central deployment bundle downloaded from the Nutanix portal.  Alternatively, Prism Element provides a one‑click download if Internet connectivity is available.
3. **Deploy Prism Central:**  Specify resources (vCPUs, memory, storage container) and network.  After deployment, Prism Central will be accessible at `https://<prism_central_ip>:9440` and will discover the existing cluster automatically.
4. **Register the cluster with Prism Central** and create projects, categories and user roles as needed.

## Layer 4 – Create storage containers and networks

1. **Storage containers:**  Within Prism Central, create one or more storage containers on the AOS cluster.  These containers will back Nutanix Volumes and provide persistent storage to Kubernetes.
2. **Networks:**  Define VLAN‑backed networks for VM management, Kubernetes nodes, pod workloads and storage traffic.  Allocate IP pools or integrate with external DHCP/IPAM services.

## Layer 5 – Provision the management (jump) host

1. **Create a VM:**  In Prism Central, navigate to **Compute & Storage → VMs → New VM**.  Select the Ubuntu 22.04 cloud image as the base disk, assign 2 vCPUs, 6 GiB RAM and 60 GB disk【472257869343838†L195-L200】.  Attach to the management network and set a static IP.
2. **Hardening:**  After booting, log in and:
   * **Update packages** – keeping the system current helps close vulnerabilities【841446552574758†L159-L175】:

     ```bash
     sudo apt-get update && sudo apt-get upgrade -y
     ```

   * **Create a non‑root user** and lock unused accounts【841446552574758†L177-L210】:

     ```bash
     sudo adduser deployer
     sudo passwd -l root      # lock root login
     ```

   * **Enable a firewall** using `ufw` or `iptables`.  The hardening guide illustrates how iptables can allow only SSH and HTTP and drop all other traffic【841446552574758†L248-L260】.
   * **Secure SSH** by editing `/etc/ssh/sshd_config`: disable root login (`PermitRootLogin no`), disallow empty passwords (`PermitEmptyPasswords no`) and optionally change the SSH port【841446552574758†L271-L297】.
   * **Review running services** and ensure only required services are active using `service --status-all`【841446552574758†L310-L324】.

3. **Install required tools:**
   * **Docker** – used by NKP for bootstrap clusters.  On Debian/Ubuntu, install prerequisites, add Docker’s repository and install the engine.  A community NKP guide lists the commands for Debian; adapt accordingly【472257869343838†L215-L245】.
   * **kubectl** – download the latest binary and move it to `/usr/local/bin`【472257869343838†L253-L261】.
   * **Helm** – install via the official script (`curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash`).
   * **Optional tools** – k9s for TUI management, bash‑completion.
4. **Generate SSH keys:**  Run `ssh-keygen` to create a key pair for NKP cluster access【900619056792212†L247-L253】.  Upload the public key to Prism Central as needed.

## Layer 6 – Install the NKP CLI and prepare images

1. **Download NKP binary:**  From your management host, download the NKP CLI from the Nutanix portal and extract it.  The NKP preparation guide shows an example using version 2.12.1【900619056792212†L189-L221】:

   ```bash
   curl -Lo nkp_v2.12.1_linux_amd64.tar.gz "<download_url_from_portal>"
   tar -zvxf nkp_v2.12.1_linux_amd64.tar.gz
   sudo mv nkp /usr/local/bin/
   nkp version
   ```

   The `nkp version` command should display component versions such as `kommander`, `konvoy` and `nkp`【900619056792212†L209-L221】.
2. **Upload node OS image:**  In Prism Central, navigate to **Compute & Storage → Images**, click **Add Image**, select **URL** and provide the link to the NKP node OS (for example, the Rocky Linux cloud image)【900619056792212†L233-L244】.  This image will be used to create control‑plane and worker nodes.

## Layer 7 – Deploy the NKP management cluster and Kubernetes clusters

1. **Bootstrap cluster:**  NKP creates a temporary “bootstrap cluster” in Docker to orchestrate cluster creation.  Initialise it using the NKP CLI.  For example:

   ```bash
   nkp init bootstrap --workspace bootstrap-workspace
   ```

   This creates a KIND‑based cluster inside Docker.
2. **Create the management cluster:**  Use NKP to create a management cluster that runs platform services (Prometheus, Grafana, Velero, etc.).  Supply the Prism Central endpoint, credentials and SSH public key.  Example (adapt parameters accordingly):

   ```bash
   nkp create management-cluster my-mgmt \
       --prism-endpoint <prism_central_ip> \
       --prism-port 9440 \
       --prism-username admin \
       --prism-password <secret> \
       --ssh-public-key ~/.ssh/id_rsa.pub \
       --os-image-name ubuntu-22.04-cloud \
       --control-plane-node-count 3 \
       --worker-node-count 3
   ```

   NKP provisions AHV VMs as control‑plane and worker nodes using the uploaded OS image and configures them as a Kubernetes cluster.
3. **Create additional clusters:**  Use `nkp create cluster` to deploy workload clusters as needed.  Workload clusters can be single‑node for dev/test or multi‑node for production.  Provide cluster name, node counts and network parameters similar to the management cluster.

## Layer 8 – Install Nutanix CSI driver and set up persistent storage

Persistent volumes in Kubernetes are provided by the Nutanix Container Storage Interface (CSI) driver, which provisions volumes from AOS storage and exposes them to pods.  A sample Helm‑based installation is available in the **rancher‑on‑nutanix** repository.  The steps below summarise the process【821221309257650†L538-L579】:

1. **Create a namespace for the driver:**

   ```bash
   kubectl create namespace ntnx-system
   ```

2. **Add the Nutanix Helm repository and update:**

   ```bash
   helm repo add nutanix https://nutanix.github.io/helm/
   helm repo update nutanix
   ```

3. **Install the snapshot controller:**

   ```bash
   helm upgrade --install -n ntnx-system \
       nutanix-csi-snapshot nutanix/nutanix-csi-snapshot \
       --set tls.renew=true --wait
   ```

4. **Install the CSI driver and configure storage classes:**  Set environment variables for the Prism Element VIP, credentials and storage container name.  Example:

   ```bash
   export FILE_SERVER_NAME="BootcampFS"
   export PRISM_ELEMENT_VIP="10.38.20.7"
   export PRISM_ELEMENT_USER="admin"
   export PRISM_ELEMENT_PASS="password"
   export STORAGE_CONTAINER_NAME="Default"

   helm upgrade --install -n ntnx-system \
     nutanix-csi nutanix/nutanix-csi-storage \
     --set fileServerName=${FILE_SERVER_NAME} \
     --set prismEndPoint=${PRISM_ELEMENT_VIP} \
     --set username=${PRISM_ELEMENT_USER} \
     --set password=${PRISM_ELEMENT_PASS} \
     --set storageContainer=${STORAGE_CONTAINER_NAME} \
     --set volumeClass=true \
     --set volumeClassName=nutanix-volume \
     --set dynamicFileClass=true \
     --set dynamicFileClassName=nutanix-dynamicfile \
     --set defaultStorageClass=nutanix-volume \
     --set secretName=ntnx-secret \
     --set createSecret=true \
     --set kubeletDir=/var/lib/kubelet \
     --wait
   ```

   The options above create both block and file‑based storage classes and set `nutanix-volume` as the default.

## Layer 9 – Deploy application workloads

1. **Build container images:**  Build the application and database containers (for example, a front‑end React app and a backend service).  Push images to a registry accessible to the cluster (Harbor, Docker Hub or Nutanix image registry).
2. **Deploy databases:**  Use Nutanix volumes to back stateful database pods (e.g., PostgreSQL).  Create a PersistentVolumeClaim referencing the `nutanix-volume` storage class and deploy the database as a StatefulSet.
3. **Deploy front‑end application:**  Create a Kubernetes Deployment for the front‑end container and expose it via a Service and Ingress.  Configure resource requests/limits, liveness/readiness probes and update strategies.

## Layer 10 – Hardening, updates and monitoring

* **Operating system updates:**  Use package managers (`apt-get update` & `upgrade`) regularly and consider enabling `unattended-upgrades` for security patches【841446552574758†L159-L175】.
* **Least privilege:**  Use non‑root users for services and limit access via sudo as recommended in the hardening guide【841446552574758†L177-L210】.
* **Network security:**  Restrict inbound traffic using iptables/ufw – allow only required ports and drop everything else【841446552574758†L248-L260】.  Use Prism Flow or external firewalls to segment workloads.
* **Cluster RBAC and network policies:**  Define Kubernetes RBAC roles for users and service accounts.  Apply network policies to control pod‑to‑pod communication.
* **Monitoring and logging:**  NKP includes Prometheus and Grafana for metrics and Velero for backups【472257869343838†L31-L44】.  Configure alerts and integrate with external logging solutions such as Nutanix’s Ops service, Elasticsearch or Splunk.
* **Disaster recovery:**  Use Nutanix data protection features to replicate volumes and clusters to secondary sites.  Test backups regularly.

## Conclusion

This overview explains how to layer the build of a Nutanix‑based infrastructure.  Each step builds upon the previous one: first install AHV and AOS, create the cluster, deploy Prism Central, prepare the management host, install the NKP CLI, create Kubernetes clusters with persistent storage, and finally deploy applications.  Detailed commands and troubleshooting guidance are provided in the deployment walk‑through.