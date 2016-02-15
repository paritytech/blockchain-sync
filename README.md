# Blockchain Sync

A benchmarking utility for Ethereum clients.

## Usage

```
npm install
# install and configure a client, if necessary

bin/run-benc <client-name> enode://<public key>@host:port
```

The utility will attempt to connect the profiled client to a running "master" client and sync up from it.
