#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { QaseClient } from './client.js';

class QaseMcpServer {
  private server: Server;
  private qaseClient: QaseClient;

  constructor() {
    this.server = new Server(
      {
        name: 'qase-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    try {
      this.qaseClient = new QaseClient();
    } catch (error) {
      console.error('Failed to initialize Qase client:', error);
      throw error;
    }

    this.setupRequestHandlers();
  }

  private setupRequestHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_projects',
          description: 'プロジェクト一覧を取得します',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_test_cases',
          description: '指定したプロジェクトのテストケース一覧を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              project_code: {
                type: 'string',
                description: 'プロジェクトコード',
              },
            },
            required: ['project_code'],
          },
        },
        {
          name: 'create_test_case',
          description: 'テストケースを作成します',
          inputSchema: {
            type: 'object',
            properties: {
              project_code: {
                type: 'string',
                description: 'プロジェクトコード',
              },
              title: {
                type: 'string',
                description: 'テストケースのタイトル',
              },
              description: {
                type: 'string',
                description: 'テストケースの説明',
              },
            },
            required: ['project_code', 'title'],
          },
        },
        {
          name: 'create_test_run',
          description: 'テスト実行を作成します',
          inputSchema: {
            type: 'object',
            properties: {
              project_code: {
                type: 'string',
                description: 'プロジェクトコード',
              },
              title: {
                type: 'string',
                description: 'テスト実行のタイトル',
              },
              description: {
                type: 'string',
                description: 'テスト実行の説明',
              },
              cases: {
                type: 'array',
                items: {
                  type: 'number',
                },
                description: 'テスト実行に含めるテストケースのID一覧',
              },
            },
            required: ['project_code', 'title'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_projects': {
            const response = await this.qaseClient.getProjects();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response.result, null, 2),
                },
              ],
            };
          }

          case 'get_test_cases': {
            const args = request.params.arguments;
            if (!args || typeof args.project_code !== 'string') {
              throw new McpError(
                ErrorCode.InvalidParams,
                'project_code must be a string'
              );
            }
            const response = await this.qaseClient.getTestCases(args.project_code);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response.result, null, 2),
                },
              ],
            };
          }

          case 'create_test_case': {
            const args = request.params.arguments;
            if (!args || typeof args.project_code !== 'string') {
              throw new McpError(
                ErrorCode.InvalidParams,
                'project_code must be a string'
              );
            }
            if (typeof args.title !== 'string') {
              throw new McpError(
                ErrorCode.InvalidParams,
                'title must be a string'
              );
            }
            const { project_code, ...testCase } = args;
            const response = await this.qaseClient.createTestCase(
              project_code,
              testCase
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response.result, null, 2),
                },
              ],
            };
          }

          case 'create_test_run': {
            const args = request.params.arguments;
            if (!args || typeof args.project_code !== 'string') {
              throw new McpError(
                ErrorCode.InvalidParams,
                'project_code must be a string'
              );
            }
            if (typeof args.title !== 'string') {
              throw new McpError(
                ErrorCode.InvalidParams,
                'title must be a string'
              );
            }
            const { project_code, ...run } = args;
            const response = await this.qaseClient.createTestRun(
              project_code,
              run as { title: string; description?: string; cases?: number[] }
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response.result, null, 2),
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        console.error('Error executing tool:', error);
        return {
          content: [
            {
              type: 'text',
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Qase MCP server running on stdio');
  }
}

const server = new QaseMcpServer();
server.run().catch(console.error);
