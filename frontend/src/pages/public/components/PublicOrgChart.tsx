import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import styled from 'styled-components';

export interface OrgNode {
  id: string;
  title: string;
  subtitle?: string;
  children: OrgNode[];
}

interface PublicOrgChartProps {
  data: OrgNode;
}

const StyledNode = styled.div`
  padding: 12px;
  border-radius: 8px;
  display: inline-block;
  border: 1px solid #e5e7eb;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: 180px;
  transition: all 0.2s ease-in-out;
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-color: #93c5fd;
    transform: translateY(-2px);
  }
`;

export function PublicOrgChart({ data }: PublicOrgChartProps) {
  const renderNode = (node: OrgNode, isRoot: boolean = false) => {
    return (
      <StyledNode className={isRoot ? 'bg-blue-50 border-blue-200' : ''}>
        <div className="flex flex-col items-center justify-center text-center">
          <div className="font-bold text-sm text-gray-900">{node.title}</div>
          {node.subtitle && (
            <div className="text-xs text-blue-600 font-medium mt-1 uppercase tracking-wider">
              {node.subtitle}
            </div>
          )}
        </div>
      </StyledNode>
    );
  };

  const renderTree = (node: OrgNode, isRoot: boolean = false) => {
    if (isRoot) {
      return (
        <Tree
          lineWidth={'2px'}
          lineColor={'#94a3b8'}
          lineBorderRadius={'10px'}
          label={renderNode(node, true)}
        >
          {node.children.map(child => renderTree(child))}
        </Tree>
      );
    }

    return (
      <TreeNode key={node.id} label={renderNode(node)}>
        {node.children.map(child => renderTree(child))}
      </TreeNode>
    );
  };

  return (
    <div className="overflow-x-auto p-8 w-full flex justify-center">
      <div className="min-w-max pb-12">
        {renderTree(data, true)}
      </div>
    </div>
  );
}
