import { join } from 'node:path';
import {
  Fn,
  RemovalPolicy,
  Stack,
  type StackProps,
  aws_route53_targets,
} from 'aws-cdk-lib';
import {
  EndpointType,
  type IResource,
  LambdaIntegration,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
  SecurityPolicy,
} from 'aws-cdk-lib/aws-apigateway';
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  type NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';

interface ToDoLambdas {
  indexLambda: NodejsFunction;
  getAllLambda: NodejsFunction;
  createToDoLambda: NodejsFunction;
  deleteToDoLambda: NodejsFunction;
}

interface ToDosStackProps extends StackProps {
  hostedZoneName: string;
  domainName: string;
}

export class ToDosStack extends Stack {
  #TODOS_API_RESOURCE = 'todos';

  #TABLE_NAME = 'todos';

  #TABLE_PARTITION_KEY = 'id';

  constructor(scope: Construct, id: string, props: ToDosStackProps) {
    super(scope, id, props);

    const todosTable = this.initializeDatabase();
    const lambdas = this.initializeLambdas();

    this.initializeLambdaPermisisons(lambdas, todosTable);

    const api = this.initializeApiGateway(props);
    this.initializeApiEndpoints(api, lambdas);
  }

  private initializeDatabase() {
    const todosTable = new Table(this, 'todos', {
      partitionKey: {
        name: this.#TABLE_PARTITION_KEY,
        type: AttributeType.STRING,
      },
      tableName: this.#TABLE_NAME,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    return todosTable;
  }

  private initializeLambdas(): ToDoLambdas {
    const defaultLambdaProps: NodejsFunctionProps = {
      depsLockFilePath: join(__dirname, 'lambdas', 'package-lock.json'),
      environment: {
        PRIMARY_KEY: this.#TABLE_PARTITION_KEY,
        TABLE_NAME: this.#TABLE_NAME,
      },
      runtime: Runtime.NODEJS_20_X,
    };

    const getAllLambda = new NodejsFunction(this, 'getAllItemsFunction', {
      entry: join(__dirname, 'lambdas', 'get-all', 'get-all.handler.ts'),
      ...defaultLambdaProps,
    });

    const indexLambda = new NodejsFunction(this, 'indexFunction', {
      entry: join(__dirname, 'lambdas', 'index', 'index.handler.ts'),
      ...defaultLambdaProps,
    });

    const createToDoLambda = new NodejsFunction(this, 'createToDoFunction', {
      entry: join(__dirname, 'lambdas', 'create', 'create.handler.ts'),
      ...defaultLambdaProps,
    });

    const deleteToDoLambda = new NodejsFunction(this, 'deleteToDoFunction', {
      entry: join(__dirname, 'lambdas', 'delete', 'delete.handler.ts'),
      ...defaultLambdaProps,
    });

    return { getAllLambda, indexLambda, createToDoLambda, deleteToDoLambda };
  }

  private initializeLambdaPermisisons(lambdas: ToDoLambdas, todosTable: Table) {
    todosTable.grantReadData(lambdas.getAllLambda);
    todosTable.grantReadData(lambdas.indexLambda);
    todosTable.grantReadWriteData(lambdas.createToDoLambda);
    todosTable.grantReadWriteData(lambdas.deleteToDoLambda);
  }

  private initializeApiGateway(props: ToDosStackProps): RestApi {
    const hostedZone = HostedZone.fromLookup(this, 'emDevOrg', {
      domainName: props.hostedZoneName,
    });
    const certificate = new Certificate(this, 'toDosCertificate', {
      domainName: props.domainName,
      validation: CertificateValidation.fromDns(hostedZone),
    });
    const api = new RestApi(this, 'todosApi', {
      restApiName: 'ToDos Service',
      domainName: {
        domainName: props.domainName,
        certificate,
        securityPolicy: SecurityPolicy.TLS_1_2,
        endpointType: EndpointType.EDGE,
      },
    });

    new ARecord(this, 'todosARecord', {
      zone: hostedZone,
      recordName: props.domainName,
      target: RecordTarget.fromAlias(new aws_route53_targets.ApiGateway(api)),
    });

    return api;
  }

  private initializeApiEndpoints(
    api: RestApi,
    {
      getAllLambda,
      indexLambda,
      createToDoLambda,
      deleteToDoLambda,
    }: ToDoLambdas,
  ) {
    const indexIntegration = new LambdaIntegration(indexLambda);
    const getAllIntegration = new LambdaIntegration(getAllLambda);
    const createIntegration = new LambdaIntegration(createToDoLambda);
    const deleteIntegration = new LambdaIntegration(deleteToDoLambda);

    api.root.addMethod('GET', indexIntegration);
    this.addCorsOptions(api.root);

    const items = api.root.addResource(this.#TODOS_API_RESOURCE);
    items.addMethod('GET', getAllIntegration);
    items.addMethod('POST', createIntegration);
    this.addCorsOptions(items);

    const singleItem = items.addResource('{id}');
    singleItem.addMethod('DELETE', deleteIntegration);
    this.addCorsOptions(singleItem);
  }

  private addCorsOptions(apiResource: IResource) {
    apiResource.addMethod(
      'OPTIONS',
      new MockIntegration({
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers':
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
              'method.response.header.Access-Control-Allow-Origin': "'*'",
              'method.response.header.Access-Control-Allow-Credentials':
                "'false'",
              'method.response.header.Access-Control-Allow-Methods':
                "'OPTIONS,GET,PUT,POST,DELETE'",
            },
          },
        ],
        passthroughBehavior: PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': '{"statusCode": 200}',
        },
      }),
      {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
              'method.response.header.Access-Control-Allow-Origin': true,
            },
          },
        ],
      },
    );
  }
}
