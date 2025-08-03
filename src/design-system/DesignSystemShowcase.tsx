/**
 * Design System Showcase
 * Live demo of all design system components
 */

import React from 'react';
import {
  // Typography
  Heading,
  Text,
  Label,
  Caption,
  Code,
  Link,
  
  // Buttons
  Button,
  ButtonGroup,
  IconButton,
  
  // Icons
  Icon,
  StatusIcon,
  iconMap,
  
  // Layout
  Container,
  Stack,
  Grid,
  Card,
  Section,
  Divider,
} from './index';

export const DesignSystemShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Section background="gradient">
        <Container>
          <Stack spacing={4}>
            <Heading level={1}>ALF Design System</Heading>
            <Text size="lg" color="secondary">
              A comprehensive, performance-first design system for the ALF Coach platform
            </Text>
          </Stack>
        </Container>
      </Section>

      {/* Typography */}
      <Section>
        <Container>
          <Stack spacing={8}>
            <div>
              <Heading level={2}>Typography</Heading>
              <Text color="muted">Consistent text styling across the application</Text>
            </div>
            
            <Grid cols={2} gap={6}>
              <Card>
                <Stack spacing={3}>
                  <Heading level={3}>Headings</Heading>
                  <Heading level={1}>Heading 1</Heading>
                  <Heading level={2}>Heading 2</Heading>
                  <Heading level={3}>Heading 3</Heading>
                  <Heading level={4}>Heading 4</Heading>
                  <Heading level={5}>Heading 5</Heading>
                  <Heading level={6}>Heading 6</Heading>
                </Stack>
              </Card>
              
              <Card>
                <Stack spacing={3}>
                  <Heading level={3}>Text Styles</Heading>
                  <Text size="xl">Extra large text</Text>
                  <Text size="lg">Large text</Text>
                  <Text>Base text (default)</Text>
                  <Text size="sm">Small text</Text>
                  <Text size="xs">Extra small text</Text>
                  <Divider />
                  <Text weight="bold">Bold text</Text>
                  <Text weight="semibold">Semibold text</Text>
                  <Text weight="medium">Medium text</Text>
                  <Text color="primary">Primary color</Text>
                  <Text color="error">Error color</Text>
                  <Text color="success">Success color</Text>
                  <Caption>Caption text</Caption>
                  <Code>const code = "example";</Code>
                  <Link href="#">Link example</Link>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Buttons */}
      <Section background="gray">
        <Container>
          <Stack spacing={8}>
            <div>
              <Heading level={2}>Buttons</Heading>
              <Text color="muted">Unified button system with consistent variants</Text>
            </div>
            
            <Stack spacing={6}>
              {/* Button Variants */}
              <Card>
                <Stack spacing={4}>
                  <Heading level={3}>Variants</Heading>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="success">Success</Button>
                  </div>
                </Stack>
              </Card>

              {/* Button Sizes */}
              <Card>
                <Stack spacing={4}>
                  <Heading level={3}>Sizes</Heading>
                  <div className="flex items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </Stack>
              </Card>

              {/* Button States */}
              <Card>
                <Stack spacing={4}>
                  <Heading level={3}>States</Heading>
                  <div className="flex flex-wrap gap-3">
                    <Button>Normal</Button>
                    <Button disabled>Disabled</Button>
                    <Button loading>Loading</Button>
                  </div>
                </Stack>
              </Card>

              {/* Button with Icons */}
              <Card>
                <Stack spacing={4}>
                  <Heading level={3}>With Icons</Heading>
                  <div className="flex flex-wrap gap-3">
                    <Button leftIcon="rocket">Launch</Button>
                    <Button rightIcon="forward">Continue</Button>
                    <Button leftIcon="save" rightIcon="check">Save Changes</Button>
                  </div>
                </Stack>
              </Card>

              {/* Button Group */}
              <Card>
                <Stack spacing={4}>
                  <Heading level={3}>Button Group</Heading>
                  <ButtonGroup>
                    <Button variant="secondary">Left</Button>
                    <Button variant="secondary">Center</Button>
                    <Button variant="secondary">Right</Button>
                  </ButtonGroup>
                </Stack>
              </Card>

              {/* Icon Buttons */}
              <Card>
                <Stack spacing={4}>
                  <Heading level={3}>Icon Buttons</Heading>
                  <div className="flex gap-3">
                    <IconButton icon="edit" label="Edit" />
                    <IconButton icon="copy" label="Copy" />
                    <IconButton icon="delete" label="Delete" variant="danger" />
                    <IconButton icon="star" label="Favorite" variant="primary" />
                  </div>
                </Stack>
              </Card>
            </Stack>
          </Stack>
        </Container>
      </Section>

      {/* Icons */}
      <Section>
        <Container>
          <Stack spacing={8}>
            <div>
              <Heading level={2}>Icons</Heading>
              <Text color="muted">Lucide React icons replacing all emoji usage</Text>
            </div>
            
            <Card>
              <Stack spacing={6}>
                <Heading level={3}>Icon Mapping (Emoji → Icon)</Heading>
                
                <Grid cols={4} gap={4}>
                  <div className="flex items-center gap-3">
                    <Text>🎯 →</Text>
                    <Icon name="target" />
                    <Caption>target</Caption>
                  </div>
                  <div className="flex items-center gap-3">
                    <Text>🚀 →</Text>
                    <Icon name="rocket" />
                    <Caption>rocket</Caption>
                  </div>
                  <div className="flex items-center gap-3">
                    <Text>📚 →</Text>
                    <Icon name="book" />
                    <Caption>book</Caption>
                  </div>
                  <div className="flex items-center gap-3">
                    <Text>💡 →</Text>
                    <Icon name="lightbulb" />
                    <Caption>lightbulb</Caption>
                  </div>
                  <div className="flex items-center gap-3">
                    <Text>🔧 →</Text>
                    <Icon name="tool" />
                    <Caption>tool</Caption>
                  </div>
                  <div className="flex items-center gap-3">
                    <Text>🌟 →</Text>
                    <Icon name="star" />
                    <Caption>star</Caption>
                  </div>
                  <div className="flex items-center gap-3">
                    <Text>🎨 →</Text>
                    <Icon name="palette" />
                    <Caption>palette</Caption>
                  </div>
                  <div className="flex items-center gap-3">
                    <Text>📊 →</Text>
                    <Icon name="chart" />
                    <Caption>chart</Caption>
                  </div>
                </Grid>

                <Divider />

                <Heading level={3}>Status Icons</Heading>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <StatusIcon status="success" />
                    <Caption>Success</Caption>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status="error" />
                    <Caption>Error</Caption>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status="warning" />
                    <Caption>Warning</Caption>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status="info" />
                    <Caption>Info</Caption>
                  </div>
                </div>

                <Divider />

                <Heading level={3}>Icon Sizes</Heading>
                <div className="flex items-center gap-4">
                  <Icon name="star" size="xs" />
                  <Icon name="star" size="sm" />
                  <Icon name="star" size="md" />
                  <Icon name="star" size="lg" />
                  <Icon name="star" size="xl" />
                </div>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>

      {/* Layout Components */}
      <Section background="gray">
        <Container>
          <Stack spacing={8}>
            <div>
              <Heading level={2}>Layout Components</Heading>
              <Text color="muted">Consistent spacing and layout patterns</Text>
            </div>
            
            <Stack spacing={6}>
              {/* Grid Demo */}
              <Card>
                <Stack spacing={4}>
                  <Heading level={3}>Grid System</Heading>
                  <Grid cols={3} gap={4}>
                    <Card shadow="sm" className="bg-primary-50">
                      <Text>Grid Item 1</Text>
                    </Card>
                    <Card shadow="sm" className="bg-primary-50">
                      <Text>Grid Item 2</Text>
                    </Card>
                    <Card shadow="sm" className="bg-primary-50">
                      <Text>Grid Item 3</Text>
                    </Card>
                  </Grid>
                </Stack>
              </Card>

              {/* Stack Demo */}
              <Card>
                <Stack spacing={4}>
                  <Heading level={3}>Stack Component</Heading>
                  <Stack spacing={2} className="bg-gray-50 p-4 rounded">
                    <Card shadow="sm">Stack Item 1</Card>
                    <Card shadow="sm">Stack Item 2</Card>
                    <Card shadow="sm">Stack Item 3</Card>
                  </Stack>
                </Stack>
              </Card>

              {/* Card Variants */}
              <Grid cols={3} gap={4}>
                <Card padding="sm" shadow="none">
                  <Heading level={4}>Small Padding</Heading>
                  <Caption>No shadow</Caption>
                </Card>
                <Card padding="md" shadow="sm">
                  <Heading level={4}>Medium Padding</Heading>
                  <Caption>Small shadow (default)</Caption>
                </Card>
                <Card padding="lg" shadow="lg" hover>
                  <Heading level={4}>Large Padding</Heading>
                  <Caption>Large shadow + hover</Caption>
                </Card>
              </Grid>
            </Stack>
          </Stack>
        </Container>
      </Section>

      {/* Feature Flags */}
      <Section>
        <Container>
          <Stack spacing={4}>
            <Heading level={2}>Feature Flag System</Heading>
            <Card>
              <Stack spacing={3}>
                <Text>The design system includes feature flags for gradual rollout:</Text>
                <Code>window.alfDesignFlags.enableAll()</Code>
                <Code>window.alfDesignFlags.enable('use-new-buttons')</Code>
                <Code>window.alfDesignFlags.status()</Code>
                <Caption>Open the console to try these commands in development mode</Caption>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </div>
  );
};