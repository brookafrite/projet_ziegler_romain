import { Pipe, PipeTransform } from '@angular/core';

import { PollutionLevel, pollutionLevel } from '../utils/pollution-level';

/**
 * Affiche le niveau de dangerosité à partir de l'indice.
 * Utilisation : {{ pollution.indice | pollutionLevel }}  →  « Modérée »
 *
 * Pipe pure (comportement par défaut) : Angular ne la recalcule que si l'indice change.
 */
@Pipe({ name: 'pollutionLevel' })
export class PollutionLevelPipe implements PipeTransform {
  transform(indice: number | null | undefined): PollutionLevel {
    return pollutionLevel(indice);
  }
}
