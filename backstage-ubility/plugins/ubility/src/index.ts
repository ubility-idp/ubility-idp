import { Entity } from '@backstage/catalog-model';
import { catalogInfoBase } from './constants';

export {
  ubilityPlugin,
  UbilityPage,
  EntityUbilityServiceContent,
  EntityUbilityClusterContent,
} from './plugin';

export const isUbilityAvailable = (entity: Entity) => {
  return (
    Boolean(entity.metadata.annotations?.[`${catalogInfoBase}ip`]) ||
    Boolean(entity.metadata.annotations?.[`${catalogInfoBase}svc`])
  );
};

export const isUbilityCluster = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[`${catalogInfoBase}ip`]);

export const isUbilityService = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[`${catalogInfoBase}svc`]);
