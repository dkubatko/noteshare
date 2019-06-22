class TrieNode {
    
    constructor() {
        this.children_chars = [];
        this.children_nodes = [];
        this.end_of_word = 0;
    }

}


class Trie {
    
    constructor() {
        this.root = this.getNode();
    }

    getNode() {
        return new TrieNode();
    }

    insert( key ) {
        let curr_trie_node = this.root;
        for ( let i = 0; i < key.length; i++ ) {
            var index = curr_trie_node.children_chars.indexOf(key.substring(i, i+1));
            if ( index == -1 ) {
                curr_trie_node.children_chars.push( key.substring(i, i+1) );
                curr_trie_node.children_nodes.push( this.getNode() );
                curr_trie_node = curr_trie_node.children_nodes[curr_trie_node.children_nodes.length - 1]
            } else {
                curr_trie_node = curr_trie_node.children_nodes[index];
            }
        }

        curr_trie_node.end_of_word = 1;
    }

    search( key ) {
        let curr_trie_node = this.root;
        for ( let i = 0; i < key.length; i++ ) {
            var index = curr_trie_node.children_chars.indexOf(key.substring(i, i+1));
            if ( index == -1 ) {
                return false;
            } 
            curr_trie_node = curr_trie_node.children_nodes[index];
        }

        return ( curr_trie_node ? 1 : 0 ) && curr_trie_node.end_of_word
    }

    unexact_search( key ) {
        let curr_trie_node = this.root;
        for ( let i = 0; i < key.length; i++ ) {
            var index = curr_trie_node.children_chars.indexOf(key.substring(i, i+1));
            if ( index == -1 ) {
                return false;
            } 
            curr_trie_node = curr_trie_node.children_nodes[index];
        }

        return (curr_trie_node) ? 1 : 0;
    }

}

module.exports = Trie;