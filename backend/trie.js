/**
 * @type {TrieNode}
 *      A node in a Trie data structure
 * 
 * @property {array} children_chars 
 *      Array of characters that are the children of this TrieNode (associative array with children_nodes)
 * @property {array} children_nodes
 *      Array of TrieNode objects that are children of this TrieNode (associative array with children_chars)
 * @property {int} end_of_word
 *      Marks the end of a word if end_of_word = 1, else end_of_word = 0
 */
class TrieNode {
    
    /**
     * Initializes the properties of a TrieNode object
     */
    constructor() {
        this.children_chars = [];
        this.children_nodes = [];
        this.end_of_word = 0;
    }

}

/**
 * @type {Trie}
 *      A Retrieval Tree data structure for storing words and phrases 
 * 
 * @property {TrieNode} root 
 *      The root node of the Retrieval Tree
 */
class Trie {
    
    /**
     * Initializes the root node of a Trie 
     */
    constructor() {
        this.root = this.getNode();
    }

    /**
     * Creates a new TrieNode object
     * 
     * @returns {TrieNode}
     *      The new initialized TrieNode object 
     */
    getNode() {
        return new TrieNode();
    }

    /**
     * Inserts the key as a new word or phrase into the Trie
     *  
     * @param {string} key
     *      The word or phrase to insert into the Trie 
     */
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

    /**
     * Searches for the key as a word or phrase in the Trie 
     * 
     * @param {string} key 
     *      The word or phrase to search for in the Trie
     * 
     * @returns {int}
     *      Returns 1 if key exists as a word or phrase. Else returns 0
     */
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

    /**
     * Checks if the key is a substring of a word or phrase in the Trie
     * 
     * @param {string} key 
     *      The word or phrase to search for in the Trie
     * 
     * @returns {int}
     *      Returns 1 if key exists as a word or phrase. Else returns 0
     */
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
    
    /**
     * Gets the TrieNode associated with the key
     * 
     * @param {string} key 
     *      The word or phrase that associates with the TrieNode
     * 
     * @returns {TrieNode}
     *      Returns the TrieNode associated with the key, or returns null if the key does not exist in the Trie
     */
    get_node( key ) {
        let curr_trie_node = this.root;
        for ( let i = 0; i < key.length; i++ ) {
            var index = curr_trie_node.children_chars.indexOf(key.substring(i, i+1));
            if ( index == -1 ) {
                return null;
            }
            curr_trie_node = curr_trie_node.children_nodes[index];
        }
        return (curr_trie_node) ? curr_trie_node : null;
    }

    /**
     * Gets the possible words or phrases that begin with the key
     * 
     * @param {string} key
     *      The word or phrase to get the possible searches with
     * 
     * @returns {array} 
     *      Returns an array of strings or all possible words or phrases that begin with the key 
     */
    get_possible_searches( key ) {
        let trie_nodes = [this.get_node( key )];
        if (!trie_nodes[0]) {
            return [];
        } 
        let possible_searches = [];
        let unfinished_searches = [key];
        do {
            let curr_key = unfinished_searches.shift();
            let curr_node = trie_nodes.shift();
            if ( curr_node.end_of_word ) {
                possible_searches.push(curr_key);
            }
            for ( let i = 0; i < curr_node.children_chars.length; i++ ) {
                unfinished_searches.push(curr_key + curr_node.children_chars[i]);
                trie_nodes.push(curr_node.children_nodes[i])
            }
        } while ( unfinished_searches.length != 0 ); 
        return possible_searches;
    }
    
}

module.exports = Trie;