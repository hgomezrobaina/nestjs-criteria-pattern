import {
  CriteriaFilterOption,
  CriteriaRequestMapper,
} from "@shared/application/criteria/criteria-request-mapper";
import { CriteriaFilterType } from "@shared/domain/constants/criteria-filter-type";
import { BookCriteriaField } from "@book/domain/criteria/book-criteria-field";

/**
 * One option per public field. The type decides how the client's raw text is read;
 * the compiler does not check that this list covers the whole enum, so it is kept
 * next to it.
 */
export class BookCriteriaRequestMapper extends CriteriaRequestMapper<BookCriteriaField> {
  options(): CriteriaFilterOption<BookCriteriaField>[] {
    return [
      { field: BookCriteriaField.ID, type: CriteriaFilterType.STRING },
      { field: BookCriteriaField.TITLE, type: CriteriaFilterType.STRING },
      { field: BookCriteriaField.AUTHOR_NAME, type: CriteriaFilterType.STRING },
      { field: BookCriteriaField.PUBLISHED_AT, type: CriteriaFilterType.DATE },
      { field: BookCriteriaField.COPIES, type: CriteriaFilterType.NUMBER },
      { field: BookCriteriaField.AVAILABLE, type: CriteriaFilterType.BOOLEAN },
    ];
  }
}
