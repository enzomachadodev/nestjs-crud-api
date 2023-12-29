import { ForbiddenException, Injectable } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(
    @GetUser('id') userId: number,
    { link, title, description }: CreateBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        title,
        description: description || null,
        link,
        userId,
      },
    });

    return { bookmark };
  }

  async getBookmarks(@GetUser('id') userId: number) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
    });

    return { bookmarks };
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    return { bookmark };
  }

  async updateBookmark(
    userId: number,
    bookmarkId: number,
    { description, link, title }: UpdateBookmarkDto,
  ) {
    const bookmarkExists = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmarkExists || bookmarkExists.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    const bookmark = await this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        title,
        description,
        link,
      },
    });

    return { bookmark };
  }

  async deleteBookmark(userId: number, bookmarkId: number) {
    const bookmarkExists = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmarkExists || bookmarkExists.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
