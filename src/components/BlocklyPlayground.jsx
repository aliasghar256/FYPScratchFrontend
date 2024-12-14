import { useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { BlocklyWorkspace } from 'react-blockly';
import * as Blockly from 'blockly';
import { GlobalContext } from '../App';

const useWorkspaceConfig = () => useMemo(() => ({
  grid: {
    spacing: 20,
    length: 3,
    colour: '#fff',
    snap: true,
  },
}), []);

function BlocklyPlayground() {
  const { setData } = useContext(GlobalContext);
  const [toolboxConfig, setToolboxConfig] = useState(null); // Dynamic toolbox config state
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const workspaceConfig = useWorkspaceConfig();

  // Fetch block data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/playbook/Nmap_test/dump'); // Replace with your API endpoint
        const result = await response.json();

        const { plays } = result; // Extract `plays` from the API response

        // Dynamically define Blockly blocks based on the `plays` array
        const blocks = plays.map((play, index) => ({
          type: `block_${index}`,
          message0: play.description,
          colour: 230,
          tooltip: play.context || 'No context available',
          helpUrl: '',
        }));

        Blockly.defineBlocksWithJsonArray(blocks); // Register blocks with Blockly

        // Generate toolbox configuration
        const toolbox = {
          kind: 'flyoutToolbox',
          contents: [
            { kind: 'label', text: result.category || 'Category', 'web-class': 'category-label' },
            ...blocks.map(block => ({
              kind: 'block',
              type: block.type,
            })),
          ],
        };

        setToolboxConfig(toolbox);
        setLoading(false); // Mark loading as complete
      } catch (err) {
        console.error('Error fetching blocks:', err);
        setError('Failed to load blocks from the API.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle changes in the Blockly workspace
  const handleJsonChange = useCallback((e) => {
    if (e?.blocks?.blocks) {
      setData(e.blocks.blocks); // Save blocks state to global context
    } else {
      console.error('Invalid block data:', e);
    }
  }, [setData]);

  // Render loading or error states
  if (loading) {
    return <div>Loading blocks...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <BlocklyWorkspace
      onJsonChange={handleJsonChange}
      className="w-full h-full"
      toolboxConfiguration={toolboxConfig}
      workspaceConfiguration={workspaceConfig}
    />
  );
}

export default BlocklyPlayground;
