import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import styled from 'styled-components';
import { Plus, Trash2 } from 'lucide-react';

export interface OrgNode {
  id: string;
  title: string;
  subtitle?: string;
  children: OrgNode[];
}

interface OrgChartEditorProps {
  data: OrgNode;
  onChange: (data: OrgNode) => void;
}

const StyledNode = styled.div`
  padding: 8px;
  border-radius: 8px;
  display: inline-block;
  border: 1px solid #e2e8f0;
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  min-width: 150px;
`;

export function OrgChartEditor({ data, onChange }: OrgChartEditorProps) {
  
  // Recursively update a node's fields
  const updateNode = (currentNode: OrgNode, targetId: string, updates: Partial<OrgNode>): OrgNode => {
    if (currentNode.id === targetId) {
      return { ...currentNode, ...updates };
    }
    return {
      ...currentNode,
      children: currentNode.children.map(child => updateNode(child, targetId, updates))
    };
  };

  // Recursively add a child to a node
  const addChild = (currentNode: OrgNode, targetId: string): OrgNode => {
    if (currentNode.id === targetId) {
      const newChild: OrgNode = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'New Role',
        subtitle: '',
        children: []
      };
      return { ...currentNode, children: [...currentNode.children, newChild] };
    }
    return {
      ...currentNode,
      children: currentNode.children.map(child => addChild(child, targetId))
    };
  };

  // Recursively delete a node
  const deleteNode = (currentNode: OrgNode, targetId: string): OrgNode => {
    return {
      ...currentNode,
      children: currentNode.children
        .filter(child => child.id !== targetId)
        .map(child => deleteNode(child, targetId))
    };
  };

  const handleUpdate = (id: string, field: 'title' | 'subtitle', value: string) => {
    onChange(updateNode(data, id, { [field]: value }));
  };

  const handleAddChild = (id: string) => {
    onChange(addChild(data, id));
  };

  const handleDelete = (id: string) => {
    if (id === data.id) return; // Cannot delete root
    onChange(deleteNode(data, id));
  };

  const renderEditorNode = (node: OrgNode, isRoot: boolean = false) => {
    return (
      <StyledNode>
        <div className="flex flex-col gap-2 p-2">
          <input
            type="text"
            value={node.title}
            onChange={(e) => handleUpdate(node.id, 'title', e.target.value)}
            className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs p-1.5 border text-center font-bold text-gray-800"
            placeholder="Role Title"
          />
          <input
            type="text"
            value={node.subtitle || ''}
            onChange={(e) => handleUpdate(node.id, 'subtitle', e.target.value)}
            className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-[10px] p-1 border text-center text-gray-500"
            placeholder="Subtitle (Optional)"
          />
          
          <div className="flex justify-center gap-2 mt-2">
            <button
              onClick={() => handleAddChild(node.id)}
              className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              title="Add Subordinate"
            >
              <Plus size={14} />
            </button>
            {!isRoot && (
              <button
                onClick={() => handleDelete(node.id)}
                className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                title="Remove Role"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </StyledNode>
    );
  };

  const renderTree = (node: OrgNode, isRoot: boolean = false) => {
    if (isRoot) {
      return (
        <Tree
          lineWidth={'2px'}
          lineColor={'#cbd5e1'}
          lineBorderRadius={'10px'}
          label={renderEditorNode(node, true)}
        >
          {node.children.map(child => renderTree(child))}
        </Tree>
      );
    }

    return (
      <TreeNode key={node.id} label={renderEditorNode(node)}>
        {node.children.map(child => renderTree(child))}
      </TreeNode>
    );
  };

  return (
    <div className="overflow-x-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="min-w-max flex justify-center py-8">
        {renderTree(data, true)}
      </div>
    </div>
  );
}
