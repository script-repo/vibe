# Infrastructure Deployment Walk‑through

## Introduction

This document provides a step‑by‑step guide for building out a complete Nutanix‑based infrastructure from bare metal through Kubernetes and application deployment.  It assumes you have already reviewed the high‑level **Infrastructure Build Overview** and want more detailed commands, expected outputs and troubleshooting notes.  All commands are given for **Ubuntu 22.04 LTS** hosts and use Nutanix’s **Acropolis Hypervisor (AHV)** and **Acropolis Operating System (AOS)** for core virtualization, **Prism Central** for management, and **Nutanix Kubernetes Platform (NKP)** for container orchestration.  Persistent volumes come from **Nutanix Volumes** via the **CSI** driver.

> **Time zone note:** In this guide dates and times are given in the America/Toronto time zone.  Adjust scheduling or cron jobs appropriately if you are in a different region.

## 1 – Physical host installation (AHV/AOS)

### 1.1 Download installation media

1. Sign in to the Nutanix portal (`https://next.nutanix.com`) with your Nutanix Next account.  From the **Community Edition** or licensed downloads page, obtain:
   * The **Phoenix ISO** (AHV installer).
   * Metadata bundles and Prism Central deployment image (used later).  See Ken Moini’s deployment article for details【599562328817921†L108-L130】.
2. Use a tool like **Rufus** on your workstation to create a bootable USB drive.  **Important:** label the USB drive `PHOENIX`; the installer searches for this label and will fail if it’s missing【599562328817921†L134-L145】.

### 1.2 Prepare hardware and network

1. Verify that each node has at least three disks: one for the hypervisor boot, one SSD for the Controller VM (CVM) and one for data.  The community guide stresses that three disks are required and the CVM disk must be SSD【599562328817921†L156-L160】.
2. Plan static IP addresses.  For a single‑node cluster you need at least five IPv4 addresses: the AHV host, the CVM, a **cluster VIP**, a **data services VIP** and **Prism Central**【599562328817921†L175-L191】.  Reserve DNS names and records for each.
3. Ensure BIOS mode (not UEFI) is enabled and virtualization support is turned on【599562328817921†L166-L168】.

### 1.3 Install AHV

1. Insert the `PHOENIX` USB stick into the first host, boot from it and follow the prompts.  Select the target disks for the hypervisor and CVM.  **Do not select the option “Create single‑node cluster”** during installation; the cluster will be created later【599562328817921†L214-L218】.
2. Configure the hypervisor management IP and CVM IP as assigned earlier.  Accept the default credentials for `root`/`nutanix/4u` on the host and `nutanix`/`nutanix/4u` on the CVM【599562328817921†L244-L246】.  Repeat for additional hosts.
3. After installation, each node will boot into AHV and the CVM will automatically start.

### 1.4 Troubleshooting installation

* **Installer cannot find media:** check that the USB drive is labelled `PHOENIX`【599562328817921†L134-L145】.
* **CVM disk not detected as SSD:** some RAID controllers mask the SSD attribute.  Connect an SSD directly via SATA or ensure the RAID controller exposes it properly【599562328817921†L156-L160】.
* **Single‑node cluster option:** ensure it remains unchecked during installation【599562328817921†L214-L218】.

## 2 – Create and configure the Nutanix cluster

Once AHV and AOS are installed on each host, join them into a cluster.

### 2.1 Access a CVM and create the cluster

1. SSH into one of the CVMs using its IP address (`nutanix@<cvm_ip>`).  Default password: `nutanix/4u`【599562328817921†L244-L246】.
2. Use the `cluster` command to create a cluster.  Specify the CVM IPs of all nodes and set a redundancy factor (1 for single‑node or 2/3 for multi‑node).  For example:

   ```bash
   # Example: create a two-node cluster called mycluster
   cluster -s "192.168.42.57,192.168.42.67" \
     --redundancy_factor=2 create

   # Give the cluster a friendly name
   ncli cluster edit-params new-name="mycluster"

   # Remove default Google DNS and add your own
   ncli cluster remove-from-name-servers servers="8.8.8.8,8.8.4.4"
   ncli cluster add-to-name-servers servers="192.168.42.9,192.168.42.10"

   # Set the external VIPs
   ncli cluster set-external-ip-address external-ip-address="192.168.42.58"
   ncli cluster edit-params external-data-services-ip-address="192.168.42.59"

   # Start the cluster (if not already started)
   cluster start
   ```

   These commands are adapted from community examples【599562328817921†L255-L276】 and create a cluster, rename it, configure DNS and assign virtual IP addresses.
3. Verify cluster status:

   ```bash
   cluster status        # should show services up and running
   ncli cluster info     # prints cluster details
   ```

### 2.2 Initial Prism Element configuration

1. Open a browser to `https://<cvm_ip>:9440`.  If Chrome blocks the self‑signed certificate, type `thisisunsafe` on the warning page to continue【599562328817921†L295-L301】.
2. Log in using the default admin account (`admin`/`nutanix/4u`) and change the password.  You will also need to sign in with your Nutanix Next account【599562328817921†L303-L307】.
3. **Create networks:** navigate to **Settings → Network Configuration** and click **Create Network**.  Enter a name and VLAN ID (0 for untagged)【599562328817921†L314-L323】.
4. **Create storage containers:** under **Storage**, create containers such as `images` and `machines` to separate VM templates and application disks【599562328817921†L327-L333】.
5. **Upload images:** go to **Settings → Image Configuration**, click **Upload Image**, and add ISO or cloud‑image files for Ubuntu 22.04 or other operating systems【599562328817921†L340-L347】.

### 2.3 Deploy Prism Central

1. In Prism Element’s dashboard, locate the **Prism Central** tile and click **Register or Create**.  Choose **Deploy**【599562328817921†L367-L379】.
2. Provide the Prism Central deployment bundle and metadata downloaded earlier, select **Single‑VM** deployment and assign resources (Small is adequate for a lab).  Specify the storage container and network.  Click **Deploy**【599562328817921†L370-L378】.
3. After deployment, Prism Central is reachable at `https://<pc_ip>:9440`.  Log in using `admin`/`Nutanix/4u` (note the capital `N`)【599562328817921†L389-L396】, change the password and sign in with your Nutanix portal credentials.
4. Return to Prism Element, select **Register** instead of **Deploy**, and connect your cluster to the newly created Prism Central【599562328817921†L401-L407】.

### 2.4 Troubleshooting cluster creation

* **Cluster command fails:** ensure you’re running the command on a CVM, not the AHV host; CVMs use the `nutanix` account.  Check that all CVMs have network connectivity and that the IP addresses are correct.
* **Prism Element login fails:** if the browser will not let you proceed due to the self‑signed certificate, use the `thisisunsafe` sequence【599562328817921†L295-L301】.
* **Prism Central not showing as registered:** the dashboard tile may still say “Not registered” after deployment.  Go to **Settings → Prism Central Registration** and explicitly register the cluster【599562328817921†L381-L404】.

## 3 – Provision the management (jump) host

### 3.1 Create the VM

1. In Prism Central, go to **Compute & Storage → VMs** and click **New VM**.  Provide a name like `nkp-bastion`.
2. Attach the **Ubuntu 22.04** cloud‑init image uploaded earlier.  Assign 2 vCPUs, 6 GiB RAM and at least 60 GB of disk【472257869343838†L195-L200】.  Place the VM on the management network and configure a static IP address via cloud‑init or after boot.
3. Power on the VM and log in with the default `ubuntu` user.  Update to the latest packages:

   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

### 3.2 Harden the OS

1. **Create a deployment user:**

   ```bash
   sudo adduser deployer
   sudo usermod -aG sudo deployer        # allow sudo
   sudo passwd -l root                   # lock direct root login
   ```

2. **Secure SSH:** edit `/etc/ssh/sshd_config` (use `sudo nano` or `vi`) and set:

   ```text
   PermitRootLogin no
   PermitEmptyPasswords no
   AllowUsers deployer
   Port 22222            # optional: change default port
   ```

   Restart the SSH service:

   ```bash
   sudo systemctl restart ssh
   ```

3. **Configure firewall:** using `ufw` or `iptables`, allow only required ports (SSH, HTTP/HTTPS) and drop the rest.  For iptables, the hardening guide provides example rules【841446552574758†L248-L260】:

   ```bash
   sudo iptables -A INPUT -p tcp --dport 80 -m state --state NEW,ESTABLISHED -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
   sudo iptables -A INPUT -I lo -j ACCEPT
   sudo iptables -A INPUT -j DROP
   ```

   Persist iptables rules using `iptables-persistent` or use `ufw` as an alternative.
4. **Check for weak accounts:** run `awk -F: '($3=="0"){print}' /etc/passwd` to ensure only root has UID 0 and `cat /etc/shadow | awk -F: '($2==""){print $1}'` to find accounts with empty passwords【841446552574758†L182-L195】.

### 3.3 Install required tooling

1. **Docker** – the NKP installer uses Docker to run a bootstrap KIND cluster.  For Ubuntu 22.04, install prerequisites and Docker (adapted from the Polar Clouds guide for Debian【472257869343838†L224-L245】):

   ```bash
   # Add Docker’s GPG key
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

   # Add the repository
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
     $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

   # Allow the deployer user to run Docker
   sudo usermod -aG docker deployer
   # Log out and back in for group changes to take effect
   ```

2. **kubectl** – download the latest stable version (adapted from the NKP preparation guide【900619056792212†L158-L171】):

   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   chmod +x kubectl
   sudo mv kubectl /usr/local/bin/
   ```

   Configure bash completion (optional):

   ```bash
   source <(kubectl completion bash)
   echo "source <(kubectl completion bash)" >> ~/.bashrc
   echo "alias k=kubectl" >> ~/.bashrc
   echo "complete -o default -F __start_kubectl k" >> ~/.bashrc
   ```

3. **Helm** – install via the official script:

   ```bash
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   ```

4. **Optional tools:** install [K9s](https://github.com/derailed/k9s) for interactive terminal management by downloading the binary as described in the NKP preparation article【900619056792212†L180-L184】.

5. **Generate SSH keys:**  Run `ssh-keygen` with no arguments to generate a new key pair【900619056792212†L247-L253】.  Keep the private key in `~/.ssh/id_rsa` and copy the public key to Prism Central when prompted by NKP.

## 4 – Install the NKP CLI and upload node images

### 4.1 Download and install the NKP CLI

1. Log in to the Nutanix portal and locate the **Nutanix Kubernetes Platform** downloads section.  Copy the download link for the NKP CLI package (for example `nkp_v2.12.1_linux_amd64.tar.gz`)【900619056792212†L189-L221】.
2. On the bastion host, download and extract the CLI:

   ```bash
   curl -Lo nkp.tar.gz "<download_url>"
   tar -zxvf nkp.tar.gz
   sudo mv nkp /usr/local/bin/
   
   # Verify
   nkp version
   ```

   The `nkp version` command prints versions for `diagnose`, `imagebuilder`, `konvoy`, `kommander` and `nkp` itself【900619056792212†L209-L221】.  If it fails, ensure the binary is executable and in your PATH.

### 4.2 Upload the NKP Node OS image

1. Back in the Nutanix portal, download the **NKP Node OS image (Rocky Linux or Ubuntu)** for AHV.  In Prism Central, navigate to **Compute & Storage → Images**, click **Add Image**, choose **URL** and paste the downloaded link【900619056792212†L233-L244】.
2. Select the clusters where the image should be available and click **Save**.  The image appears in the image repository once uploaded.

## 5 – Create the NKP management cluster

The management cluster hosts the NKP platform services (Prometheus, Grafana, Velero, etc.) and orchestrates lifecycle operations for workload clusters.

### 5.1 Initialize the bootstrap cluster

1. On the bastion host, run the following to initialize a bootstrap cluster.  This uses **KIND** (Kubernetes‑in‑Docker) behind the scenes:

   ```bash
   nkp init bootstrap --workspace bootstrap-workspace
   ```

   This command downloads container images and spins up a temporary Kubernetes cluster inside Docker.  If your network is slow or behind a proxy, use `--http-proxy` and `--https-proxy` flags accordingly.

### 5.2 Create the management cluster

1. Gather the following information:
   * **Prism Central IP/hostname** and port (typically `9440`).
   * **Prism Central credentials** (`admin` account and password).
   * **Cluster name** (e.g., `nkp-mgmt`).
   * **SSH public key** path (e.g., `~/.ssh/id_rsa.pub`).
   * **Node OS image name** – the name you gave when uploading the image in Prism Central.
   * **Control plane and worker node counts** – at least three control plane nodes for high availability.
   * **Subnets** – Prism Central network names for control plane and worker nodes.
2. Run the NKP create command.  The following example creates a management cluster with three control‑plane and three worker nodes using the uploaded Ubuntu image and uses Nutanix Volumes with the default storage container.  Replace placeholders with your environment values:

   ```bash
   nkp create cluster nutanix \
     --cluster-name nkp-mgmt \
     --endpoint <prism_central_ip:9440> \
     --prism-username admin \
     --prism-password <password> \
     --ssh-public-key ~/.ssh/id_rsa.pub \
     --control-plane-replicas 3 \
     --worker-replicas 3 \
     --control-plane-vcpus 4 \
     --control-plane-memory 16 \
     --worker-vcpus 4 \
     --worker-memory 16 \
     --control-plane-vm-image ubuntu-22.04-cloud \
     --worker-vm-image ubuntu-22.04-cloud \
     --control-plane-subnets k8s-mgmt-subnet \
     --worker-subnets k8s-workload-subnet \
     --csi-storage-container machines \
     --insecure     # skip certificate verification (use only in lab environments)
   ```

   The CLI will:
   1. Provision control‑plane and worker VMs on AHV using the specified image.
   2. Attach volumes from the `machines` storage container for root disks and Kubernetes persistent storage.
   3. Configure Kubernetes, install the platform applications (Prometheus, Grafana, Velero) and return a URL for the NKP Dashboard.

   This operation can take 20–30 minutes depending on network speed.  Watch the progress messages; if any step fails, consult the logs in the bootstrap cluster using `docker ps` and `docker logs`.

3. When complete, run the following to retrieve the kubeconfig and test access:

   ```bash
   nkp get kubeconfig nkp-mgmt > ~/nkp-mgmt.kubeconfig
   export KUBECONFIG=~/nkp-mgmt.kubeconfig
   kubectl get nodes
   ```

   The output should list the control‑plane and worker nodes in `Ready` state.  If nodes appear `NotReady`, check their VM status in Prism Central and ensure the OS image credentials are correct.

### 5.3 Troubleshooting NKP creation

* **Bootstrap cluster fails to initialize:** ensure Docker is running (`sudo systemctl status docker`) and that you have enough disk space (>50 GB) for the image downloads.  Use `nkp init bootstrap --dry-run` to test.
* **Authentication errors:** confirm the Prism Central IP, port and credentials.  If Prism Central uses a custom certificate, supply `--additional-trust-bundle` or `--insecure`.
* **Node OS image not found:** verify the image name with `nkp get images` or check Prism Central’s Images page.  The name must match exactly.
* **Nodes stuck in provisioning:** inspect the VM console in Prism Central for cloud‑init errors (invalid SSH key, network unreachable).  Ensure the cluster’s subnets allow outbound connections.

## 6 – Deploy workload clusters

With the management cluster running, you can deploy additional Kubernetes clusters for specific workloads.  The procedure is similar but often uses fewer control‑plane nodes.

1. Define a new cluster name (e.g., `app-cluster`) and decide how many nodes are needed.
2. Run `nkp create cluster nutanix` again with `--cluster-name app-cluster` and adjust the number of control‑plane and worker nodes.  Use separate subnets or the same network as the management cluster depending on isolation requirements.
3. Retrieve the kubeconfig with `nkp get kubeconfig app-cluster` and export it when working with that cluster.
4. Use `nkp get clusters` to list all clusters and `nkp describe cluster <name>` to view details.

## 7 – Configure persistent storage with Nutanix CSI driver

Once a cluster is up, install the CSI driver so that Kubernetes can provision volumes from AOS.

1. Create a dedicated namespace for Nutanix components:

   ```bash
   kubectl create namespace ntnx-system
   ```

2. Add the Nutanix Helm repository and update the index【821221309257650†L538-L579】:

   ```bash
   helm repo add nutanix https://nutanix.github.io/helm/
   helm repo update nutanix
   ```

3. Install the snapshot controller.  This component handles CSI volume snapshots:

   ```bash
   helm upgrade --install -n ntnx-system \
     nutanix-csi-snapshot nutanix/nutanix-csi-snapshot \
     --set tls.renew=true --wait
   ```

4. Export environment variables for your Prism Element VIP, credentials and storage container name.  Then deploy the storage driver【821221309257650†L538-L579】:

   ```bash
   export FILE_SERVER_NAME="MyFiles"
   export PRISM_ELEMENT_VIP="192.168.42.58"           # cluster VIP
   export PRISM_ELEMENT_USER="admin"
   export PRISM_ELEMENT_PASS="<prism_password>"
   export STORAGE_CONTAINER_NAME="machines"

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

   This installation creates `nutanix-volume` (block storage) and `nutanix-dynamicfile` (file storage) classes.  The driver communicates with Prism Element using the provided credentials.

5. Verify that the storage classes were created and that the driver pods are running:

   ```bash
   kubectl get sc
   kubectl get pods -n ntnx-system
   ```

### Troubleshooting CSI installation

* **Driver pods crash:** check the pod logs (`kubectl logs <pod> -n ntnx-system`) for authentication or network errors.  Ensure the Prism Element VIP is reachable from the cluster nodes and the credentials are valid.
* **No storage classes:** verify that the Helm installation completed successfully.  Run the install with `--debug --dry-run` to validate templates as recommended in the Rancher‑on‑Nutanix guide【821221309257650†L589-L604】.

## 8 – Deploy workloads

### 8.1 Databases

1. Create a PersistentVolumeClaim (PVC) using the `nutanix-volume` storage class:

   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: postgres-data
   spec:
     accessModes:
       - ReadWriteOnce
     storageClassName: nutanix-volume
     resources:
       requests:
         storage: 20Gi
   ```

   Apply the PVC (`kubectl apply -f pvc.yaml`).
2. Deploy a PostgreSQL StatefulSet referencing the PVC.  Ensure the container runs as a non‑root user and set environment variables for credentials.
3. Use `kubectl get pvc,pv` to verify that Nutanix volumes are bound and `kubectl exec` to inspect the database.

### 8.2 Application front‑end

1. Build the front‑end application (for example, using Node.js or a static site).  Containerize it with a `Dockerfile` and push to an accessible registry.
2. Create a Deployment manifest specifying the container image and resources.  For example:

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: notes-frontend
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: notes-frontend
     template:
       metadata:
         labels:
           app: notes-frontend
       spec:
         containers:
           - name: notes-frontend
             image: registry.example.com/notes-frontend:latest
             ports:
               - containerPort: 80
             readinessProbe:
               httpGet:
                 path: /
                 port: 80
               initialDelaySeconds: 10
               periodSeconds: 5
             livenessProbe:
               httpGet:
                 path: /
                 port: 80
               initialDelaySeconds: 20
               periodSeconds: 10
   ```

3. Expose the Deployment via a Kubernetes Service and Ingress.  If using NKP’s built‑in ingress controller (Traefik), create an Ingress resource mapping a domain to the service.

### 8.3 Expected results and validation

* Running `kubectl get nodes` should show all control‑plane and worker nodes in `Ready` state.
* Running `kubectl get sc` should list `nutanix-volume` and `nutanix-dynamicfile` as storage classes.
* Deploying the front‑end should result in healthy pods (`kubectl get pods`).  Accessing the Ingress domain in a browser should display the application.

## 9 – Maintenance, updates and monitoring

* **Regular updates:** schedule periodic `apt-get update && apt-get upgrade` on all Ubuntu hosts【841446552574758†L159-L175】.  Consider enabling `unattended-upgrades` for security patches.
* **Cluster upgrades:** use `nkp upgrade cluster` to upgrade Kubernetes versions and platform components.  Always read release notes and back up clusters before upgrading.
* **Monitoring:** access the NKP dashboard (URL printed during management cluster creation) to view metrics dashboards.  Prometheus and Grafana run by default【472257869343838†L31-L44】.  Integrate with external alerting systems if required.
* **Backups:** configure **Velero** (installed with NKP) to back up cluster resources and volumes to an object store.  Schedule regular backups and test restoration.
* **Security:** review RBAC policies, network policies and OS hardening recommendations periodically.  Use Nutanix Flow and external firewalls for micro‑segmentation.

## Conclusion

This walk‑through demonstrates how to deploy a full Nutanix‑based infrastructure using AHV, AOS, Prism Central and NKP.  It builds on the high‑level overview by providing exact commands, expected outputs and troubleshooting tips.  By following these steps, administrators can provision physical hosts, create a Nutanix cluster, deploy Prism Central, prepare a bastion host, install the NKP CLI, deploy management and workload Kubernetes clusters, configure persistent storage with the Nutanix CSI driver and finally deploy applications.  Regular maintenance, updates and monitoring will ensure the environment remains secure and stable.