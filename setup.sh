###############################################
echo installing dependencies
sudo apt -y install dkms apt-transport-https ca-certificates curl gnupg2 software-properties-common
###############################################

###############################################
#if previous failed install
sudo apt-get purge docker
sudo apt-get purge docker.io
sudo apt-get purge docker-compose
echo installing docker
echo 'deb [arch=armhf] https://download.docker.com/linux/debian buster stable' >> /etc/apt/sources.list
sudo apt-get update
curl -sL get.docker.com | sed 's/9)/10)/' | sh
###############################################

###############################################
echo fixing docker driver
echo '{
	"exec-opts": ["native.cgroupdriver=systemd"],
	"log-driver": "json-file",
	"log-opts": {
		"max-size": "100m"
	},
	"storage-driver": "overlay2"
}' > /etc/docker/daemon.json
###############################################

###############################################
echo disabling swap
sudo dphys-swapfile swapoff && sudo dphys-swapfile uninstall && sudo update-rc.d dphys-swapfile remove 
sudo systemctl disable dphys-swapfile  
###############################################

###############################################
echo Adding " cgroup_enable=cpuset cgroup_enable=memory" to /boot/cmdline.txt
sudo cp /boot/cmdline.txt /boot/cmdline_backup.txt
orig="$(head -n1 /boot/cmdline.txt) cgroup_enable=cpuset cgroup_enable=memory"                                                                             
echo $orig | sudo tee /boot/cmdline.txt
###############################################

###############################################
echo installing kube
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add - && echo "deb http://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list && sudo apt-get update
sudo apt-get install -y kubeadm
###############################################


###############################################
#echo initializing master node

sudo kubeadm reset
sudo rm -rf /var/lib/etcd # if not first time creating cluster

sudo kubeadm config images pull -v3 &&
sudo kubeadm init && # --pod-network-cidr=10.244.0.0/16 # flannel only
mkdir -p $HOME/.kube &&
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config &&
sudo chown $(id -u):$(id -g) $HOME/.kube/config &&
#make sure your vpn isn't conflicting with ip's!
kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')" &&
sudo sysctl net.bridge.bridge-nf-call-iptables=1
cp -r ./python-webhook-listener ~/
###############################################

###############################################
#echo initializing worker node
#sudo kubeadm join 192.168.1.<iphere>:6443 --token <token here> --discovery-token-ca-cert-hash <hash here>
#sudo sysctl net.bridge.bridge-nf-call-iptables=1
###############################################


###############################################
echo setting up packet forwarding between nodes
echo '#wait a bit after reboot and then configure everything
python3 /home/pi/python-webhook-listener/app.py &
sleep 90
iptables -P FORWARD ACCEPT' > /home/pi/configure.sh
chmod +x /home/pi/configure.sh

echo '#!/bin/sh -e
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.
bash /home/pi/configure.sh &

# Print the IP address
_IP=$(hostname -I) || true
if [ "$_IP" ]; then
  printf "My IP address is %s\n" "$_IP"
fi

exit 0' > /etc/rc.local

sudo bash /home/pi/configure.sh
###############################################

###############################################
echo preparing the dashboard
kubectl apply -f kubernetes-dashboard.yaml 
kubectl apply -f dashboard-admin.yaml 

echo getting login token
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
###############################################
