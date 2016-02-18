# Blockchain Sync

A benchmarking utility for Ethereum clients.

## Usage

```
npm install
# install and configure a client, if necessary

bin/run-bench [args] <client name>
```

The utility will attempt to connect the profiled client to a running "master" node and sync up from it.

## Options

* **-e, --enode**:         Enode address of a node to sync up with 
* **-d, --client-dir**:    Client installation directory
* **--client**:            Name of the client to run
* **--rm**:                Remove the data directory before sync
* **-h, --help**:          Show instructions
            
            



